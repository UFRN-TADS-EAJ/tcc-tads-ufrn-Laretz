## Hard constraints (obrigatórias)
- **GA_WEIGHT_PROFESSOR_AVAILABILITY**: prof. indisponível.
- **GA_WEIGHT_ROOM_AVAILABILITY**: sala indisponível.
- **GA_WEIGHT_ROOM_CAPACITY**: sala lotada.
- **GA_WEIGHT_ROOM_TYPE_COMPATIBILITY**: tipo de sala errado.
- **GA_WEIGHT_WORKLOAD_LIMIT**: carga do prof. acima.
- **GA_WEIGHT_TURMA_AVAILABILITY**: choque de turma.
- **GA_WEIGHT_NO_SUNDAY**: evita domingo.

## Soft constraints (preferências)
- **GA_WEIGHT_DAY_INTERVAL_QUALITY**: dias bem distribuídos.
- **GA_WEIGHT_CONSECUTIVE_CLASSES**: aulas consecutivas.
- **GA_WEIGHT_AVOID_INTRA_DAY_GAPS**: evita janelas vagas.
- **GA_WEIGHT_AVOID_SATURDAY**: evita sábado.
- **GA_WEIGHT_AVOID_T6**: evita slot T6.
- **GA_WEIGHT_PRIORITIZE_EARLY_SLOTS**: prioriza cedo.
- **GA_WEIGHT_AVOID_START_AT_2**: evita 2º bloco.