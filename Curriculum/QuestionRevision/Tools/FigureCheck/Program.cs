// Kullanım: dotnet run -- <girdi.jsonl> <çıktı.jsonl> <svg-klasörü>
// Girdi satırı: {"id","stem","options":["A metni",...],"figures":[...],"graphicExpectation":null}
//   Motor figürü: {"code","title","alt","visual":{motorun görseli},"still":{"light","dark","width","height"}|null}
//   C# figürü:    {"code","kind","title","alt","dataJson"}
// Çıktı satırı: {"id","ok","hatalar":[...],"uyarilar":[...],"figures":[{"code","kind","dataJson","still","svgLight","svgDark"}]}
// Denetimler API'nin kayıt yolundakilerle aynıdır: motor görseli Works aktarımındaki gibi ContentFigureVideoEngineConverter
// ile figüre çevrilir ve hazır resmi bağlanır; sonra ContentFigureValidator.Validate + TryValidateForPersist,
// ContentFigurePlot.Expand (kayıtta yapılan örnekleme), C# figüründe sunucu çizimi (ContentFigureSceneBuilder + SvgWriter)
// ve işaretleme derleyicisi (ExamGenerationMarkupCompiler, yalnız bilgi amaçlı). Figürleri motor çizer (1 Kasım 2026):
// hazır resmi olmayan motor figürü hatadır.
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Data.Dtos.Contents;
using Data.Helpers.Contents;
using Entity.Contents.Enum;
using Entity.Questions.Enums;
using Services.Content.Conversion;
using Services.Content.Rendering;
using Services.Content.Validation;
using Services.Generations.ExamGenerations.Models;
using Services.Generations.ExamGenerations.Validation.Structural;

if (args.Length < 3)
{
    Console.Error.WriteLine("Kullanım: FigureCheck <girdi.jsonl> <çıktı.jsonl> <svg-klasörü>");
    return 2;
}

const int CanlidaEnYuksekTur = (int)ContentFigureKind.EngineVisual; // 47–57 31 Ekim'de, 58 (motor görseli) 1 Kasım 2026'da canlıda
var girdi = args[0];
var cikti = args[1];
var svgKlasor = args[2];
Directory.CreateDirectory(svgKlasor);
var underlinePair = new Regex("<u>(.*?)</u>", RegexOptions.Singleline);
var json = new JsonSerializerOptions { WriteIndented = false };
int toplam = 0, hatali = 0, figur = 0;

using var yazici = new StreamWriter(cikti, false, new System.Text.UTF8Encoding(false));
foreach (var satir in File.ReadLines(girdi))
{
    if (string.IsNullOrWhiteSpace(satir))
        continue;
    toplam++;
    var node = JsonNode.Parse(satir)!.AsObject();
    var id = node["id"]!.GetValue<string>();
    var stem = node["stem"]?.GetValue<string>() ?? string.Empty;
    var options = node["options"]?.AsArray().Select(o => o!.GetValue<string>()).ToList() ?? new List<string>();
    QuestionGraphicExpectation? beklenti = node["graphicExpectation"] is JsonValue gv && gv.TryGetValue<int>(out var gi) ? (QuestionGraphicExpectation)gi : null;
    var hatalar = new List<string>();
    var uyarilar = new List<string>();
    var inputs = new List<ContentFigureInputDto>();
    var motorFigurleri = new HashSet<string>(StringComparer.Ordinal);
    foreach (var f in node["figures"]?.AsArray() ?? new JsonArray())
    {
        var o = f!.AsObject();
        var code = o["code"]!.GetValue<string>();
        if (o["visual"] is JsonObject visual)
        {
            // Works aktarımıyla aynı yol: görsel merkezde karşılığı varsa C# türüne çevrilir, yoksa motor görseli (58) olur;
            // hazır resim her durumda figüre bağlanır ve istemci onu gösterir.
            var v = (JsonObject)visual.DeepClone();
            v.Remove("still");
            if (o["still"] is JsonObject still)
                v["still"] = still.DeepClone();
            try
            {
                using var doc = JsonDocument.Parse(v.ToJsonString());
                var converted = ContentFigureVideoEngineConverter.ConvertValidated(doc.RootElement, code, o["alt"]?.GetValue<string>(), $"{id}/{code}", out var bekleyen);
                if (converted == null)
                {
                    hatalar.Add($"motor:{code}: görsel figüre çevrilemedi");
                    continue;
                }
                if (converted.Still == null)
                    hatalar.Add($"motor:{code}: hazır resim yok ({bekleyen ?? visual["kind"]?.GetValue<string>()}); render_figures.py çalıştırılmalı");
                // API, etiketleri koordinatlarla uyuşmayan motor geometrisini sessizce "ölçekli değil" yapar; motorun resminde bu
                // not görünmediği için öğrenci ölçekli sanır. Figür ölçekli çizilmeli (uzunluk %5, açı 2°, dik açı 90°).
                if (converted.Kind == ContentFigureKind.Geometry && JsonNode.Parse(converted.DataJson ?? "{}")?["toScale"] is JsonValue olcek && olcek.TryGetValue<bool>(out var olcekli) && !olcekli)
                    hatalar.Add($"motor:{code}: geometri ölçekli değil: etiketli bir uzunluk ya da açı çizimle tutmuyor (uzunluk %5, açı 2°)");
                converted.Title = o["title"]?.GetValue<string>();
                inputs.Add(converted);
                motorFigurleri.Add(code);
            }
            catch (ArgumentException e)
            {
                hatalar.Add($"motor:{code}: {e.Message}");
            }
            continue;
        }
        inputs.Add(new ContentFigureInputDto
        {
            Code = o["code"]!.GetValue<string>(),
            Kind = (ContentFigureKind)o["kind"]!.GetValue<int>(),
            Title = o["title"]?.GetValue<string>(),
            Alt = o["alt"]?.GetValue<string>(),
            DataJson = o["dataJson"] is JsonValue dv ? dv.GetValue<string>() : o["dataJson"]?.ToJsonString(),
        });
    }

    // 1) Üretim sözleşmesi ve kayıt öncesi denetim (API ile aynı)
    var hard = new List<string>();
    ContentFigureValidator.Validate(stem, inputs, beklenti, hard);
    hatalar.AddRange(hard.Distinct().Select(h => "figur:" + h));
    var tumMetin = stem + "\n" + string.Join("\n", options);
    if (!ContentFigureValidator.TryValidateForPersist(tumMetin, inputs, hasOtherVisual: false, out var persistError))
        hatalar.Add("kayit:" + persistError);

    // 2) Kayıtta yapılan dönüşüm ve sunucu çizimi
    var cikanFigurler = new JsonArray();
    foreach (var f in inputs)
    {
        figur++;
        if ((int)f.Kind > CanlidaEnYuksekTur)
            hatalar.Add($"figur:{f.Code}: tür {(int)f.Kind} ({f.Kind}) canlı API'de henüz yok");
        var expanded = ContentFigurePlot.Expand(f.Kind, f.DataJson);
        string? light = null, dark = null;
        var motor = motorFigurleri.Contains(f.Code);
        if (motor)
        {
            // Görüntü motorun hazır resmidir; sunucu çizimi gerekmez.
        }
        else if (ContentFigureKindCatalog.IsServerDrawn(f.Kind))
        {
            try
            {
                var scene = ContentFigureSceneBuilder.Build(f.Kind, expanded, SceneLanguage.Turkish);
                if (scene == null)
                    hatalar.Add($"cizim:{f.Code}: sunucu çizemedi");
                else
                {
                    light = Path.Combine(svgKlasor, $"{id}_{f.Code}_acik.svg");
                    dark = Path.Combine(svgKlasor, $"{id}_{f.Code}_koyu.svg");
                    File.WriteAllText(light, ContentFigureSvgWriter.Write(scene, false, f.Title));
                    File.WriteAllText(dark, ContentFigureSvgWriter.Write(scene, true, f.Title));
                }
            }
            catch (Exception e)
            {
                hatalar.Add($"cizim:{f.Code}: {e.GetType().Name}: {e.Message}");
            }
        }
        else
        {
            uyarilar.Add($"figur:{f.Code}: {f.Kind} istemcide çizilir (web/mobil); şema denetlendi, SVG üretilmedi");
        }

        cikanFigurler.Add(new JsonObject
        {
            ["code"] = f.Code.Trim(),
            ["kind"] = (int)f.Kind,
            ["title"] = f.Title,
            ["alt"] = f.Alt,
            ["dataJson"] = expanded,
            ["engine"] = motor,
            ["still"] = f.Still == null ? null : new JsonObject { ["light"] = f.Still.LightUrl, ["dark"] = f.Still.DarkUrl, ["width"] = f.Still.Width, ["height"] = f.Still.Height },
            ["svgLight"] = light,
            ["svgDark"] = dark,
        });
    }

    // 3) İşaretleme derleyicisi (bilgi amaçlı: API'nin üretim denetleyicisi çizgileri yalnız şıklarda olan kalıbı reddeder)
    var spans = new List<ExamGenerationMarkupSpan>();
    void Topla(string segment, string text)
    {
        var plain = new System.Text.StringBuilder();
        var last = 0;
        foreach (Match m in underlinePair.Matches(text))
        {
            plain.Append(text, last, m.Index - last);
            spans.Add(new ExamGenerationMarkupSpan { SegmentId = segment, Start = plain.Length, Length = m.Groups[1].Length, ExpectedText = m.Groups[1].Value, Role = ExamGenerationMarkupRole.UnderlineTarget });
            plain.Append(m.Groups[1].Value);
            last = m.Index + m.Length;
        }
    }
    Topla(ExamGenerationMarkupSegments.Stem, stem);
    var keys = "ABCDE";
    var optionDict = new Dictionary<string, string>();
    for (var i = 0; i < options.Count && i < keys.Length; i++)
    {
        optionDict[keys[i].ToString()] = options[i];
        Topla(ExamGenerationMarkupSegments.ForOption(keys[i].ToString()), options[i]);
    }
    var compiled = ExamGenerationMarkupCompiler.Compile(stem, optionDict, spans);
    if (!compiled.Success)
    {
        var yalnizSiklarda = spans.Count > 0 && spans.All(s => s.SegmentId.StartsWith(ExamGenerationMarkupSegments.OptionPrefix));
        var mesaj = $"isaret:{compiled.RejectCode}: {compiled.Detail}";
        if (yalnizSiklarda && compiled.RejectCode == ExamGenerationMarkupCompiler.ClaimedButNoSpanRejectCode)
            uyarilar.Add(mesaj + " (çizgiler yalnız şıklarda: ÖSYM kalıbı, istemci doğru gösterir)");
        else
            hatalar.Add(mesaj);
    }

    var ok = hatalar.Count == 0;
    if (!ok)
        hatali++;
    var sonuc = new JsonObject { ["id"] = id, ["ok"] = ok, ["hatalar"] = new JsonArray(hatalar.Select(h => (JsonNode)h).ToArray()), ["uyarilar"] = new JsonArray(uyarilar.Select(h => (JsonNode)h).ToArray()), ["figures"] = cikanFigurler };
    yazici.WriteLine(sonuc.ToJsonString(json));
}

Console.WriteLine($"soru: {toplam}  hatalı: {hatali}  figür: {figur}");
return hatali == 0 ? 0 : 1;
