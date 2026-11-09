"""Anthropic API (Claude modelleri: tek çağrı, Message Batches, maliyet kaydı) için motorun tek giriş noktası.

Tek uygulama Desktop/sinavika_parse/sourceparsing/claude_api.py'dedir (kaynak ayrıştırma da onu kullanır); burada
kopyası yazılmaz, yalnız içe aktarılır. Anahtar ANTHROPIC_API_KEY (ortamdan ya da motorun .env dosyasından), ekrana
yazılmaz. Sınavika API'sinin Claude içerik uçları ayrı bir şeydir: content_api.py.

Kullanım (Curriculum/Tools Python yolundayken): `import anthropic_api as api` → api.message, api.submit_batch, …
Ücretli model çağrısı sahibin açık onayıyla yapılır (model ve tutar sohbette sorulur)."""
import sys

from engine_paths import SOURCE_PARSING

if SOURCE_PARSING not in sys.path:
    sys.path.insert(0, SOURCE_PARSING)

from sourceparsing.claude_api import *  # noqa: E402,F401,F403
from sourceparsing import claude_api as _client  # noqa: E402

# `import *` leaves out the module's private names; the batch tools read the constants and helpers below by name.
API, VERSION, PRICES, params, record_usage, cost, available, message, text_of, models = (
    _client.API, _client.VERSION, _client.PRICES, _client.params, _client.record_usage, _client.cost, _client.available,
    _client.message, _client.text_of, _client.models)
submit_batch, batch_status, batch_results, wait_batch = _client.submit_batch, _client.batch_status, _client.batch_results, _client.wait_batch
