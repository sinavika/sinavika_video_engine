"""
python -m sourceparsing <command> [exam]

  stage kpss       extract KPSS sources into Curriculum/Library/_Stage (text layer, no API)
  vision kpss      read figures/formulas and the hard PDFs from page images (Claude, ANTHROPIC_API_KEY)
  code kpss [rules] code staged questions to the lesson list (rules, then Claude)
  build kpss       write the coded library: Curriculum/Library/KPSS/...
  report kpss      coverage and quality report
"""
import sys
import time


def main(argv: list[str]) -> None:
    if len(argv) < 2:
        print(__doc__)
        return
    command, exam = argv[0], argv[1].lower()
    started = time.time()
    if exam != 'kpss':
        raise SystemExit(f'{exam}: not prepared yet (KPSS first, then YKS, then ABD).')
    from . import kpss
    if command == 'stage':
        kpss.stage_all()
    elif command == 'vision':
        kpss.read_with_vision()
    elif command == 'code':
        from . import coding
        coding.code('kpss', *argv[2:])
    elif command == 'build':
        from . import build
        build.build('KPSS')
    elif command == 'report':
        from . import build
        build.report('KPSS')
    else:
        raise SystemExit(__doc__)
    print(f'done in {time.time() - started:.0f}s')


if __name__ == '__main__':
    main(sys.argv[1:])
