import { writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { diagramSchema } from '../dist/core/schema.js'
await writeFile(
  new URL('../diagram.schema.json', import.meta.url),
  JSON.stringify(z.toJSONSchema(diagramSchema), null, 2) + '\n'
)
