
import { prisma } from './db';

export async function buildSystemPrompt(tenantId: string) {
  // Pick global system template
  const tpl = await prisma.promptTemplate.findUnique({ where: { key: 'system_chatbot' } });
  if (!tpl) return 'Você é um assistente.';

  // Override for this tenant (if any)
  const ov = await prisma.promptOverride.findUnique({
    where: {
      tenantId_templateId: { tenantId, templateId: tpl.id }
    }
  });

  const content = (ov?.content ?? tpl.content)
    .replace('{{tenant_name}}', (await prisma.tenant.findUnique({ where: { id: tenantId } }))?.name || 'sua empresa');

  return content;
}
