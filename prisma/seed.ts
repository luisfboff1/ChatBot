
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const createSample = process.env.SEED_CREATE_SAMPLE_DATA === 'true';

  // Global prompt templates
  const sysTemplate = await prisma.promptTemplate.upsert({
    where: { key: 'system_chatbot' },
    update: {},
    create: {
      key: 'system_chatbot',
      content: 'Você é um assistente da empresa {{tenant_name}}. Seja objetivo, amistoso e responda em português do Brasil.',
      version: 1,
      isGlobal: true
    }
  });

  if (createSample) {
    const tenantA = await prisma.tenant.create({ data: { name: 'Sports Training', plan: 'pro' } });
    const tenantB = await prisma.tenant.create({ data: { name: 'Colavouro', plan: 'premium' } });

    const user = await prisma.user.upsert({
      where: { email: 'demo@evcomx.dev' },
      update: {},
      create: { email: 'demo@evcomx.dev', name: 'Demo User' }
    });

    await prisma.membership.create({
      data: { userId: user.id, tenantId: tenantA.id, role: 'OWNER' }
    });
    await prisma.membership.create({
      data: { userId: user.id, tenantId: tenantB.id, role: 'ADMIN' }
    });

    // Prompts específicos para cada empresa
    await prisma.promptOverride.create({
      data: {
        tenantId: tenantA.id,
        templateId: sysTemplate.id,
        content: 'Você é o assistente virtual da Sports Training, uma academia de alto rendimento. Seja motivador, use linguagem esportiva e sempre incentive a prática de exercícios. Responda em português do Brasil de forma amigável e profissional.'
      }
    });

    await prisma.promptOverride.create({
      data: {
        tenantId: tenantB.id,
        templateId: sysTemplate.id,
        content: 'Você é o assistente virtual da Colavouro, empresa especializada em soluções corporativas. Seja formal, técnico e sempre foque em soluções empresariais. Responda em português do Brasil de forma profissional e detalhada.'
      }
    });

    // Criar múltiplas conversas para Sports Training (simulando WhatsApp)
    const conv1 = await prisma.conversation.create({
      data: { tenantId: tenantA.id, title: 'João' }
    });

    const conv2 = await prisma.conversation.create({
      data: { tenantId: tenantA.id, title: 'Paulo' }
    });

    const conv3 = await prisma.conversation.create({
      data: { tenantId: tenantA.id, title: 'Maria' }
    });

    const conv4 = await prisma.conversation.create({
      data: { tenantId: tenantA.id, title: 'Carlos' }
    });

    const conv5 = await prisma.conversation.create({
      data: { tenantId: tenantA.id, title: 'Ana' }
    });

    // Criar múltiplas conversas para Colavouro
    const conv6 = await prisma.conversation.create({
      data: { tenantId: tenantB.id, title: 'Roberto' }
    });

    const conv7 = await prisma.conversation.create({
      data: { tenantId: tenantB.id, title: 'Fernanda' }
    });

    const conv8 = await prisma.conversation.create({
      data: { tenantId: tenantB.id, title: 'Lucas' }
    });

    const conv9 = await prisma.conversation.create({
      data: { tenantId: tenantB.id, title: 'Juliana' }
    });

    const conv10 = await prisma.conversation.create({
      data: { tenantId: tenantB.id, title: 'Pedro' }
    });

    // Mensagens para Sports Training
    await prisma.message.createMany({
      data: [
        // Conversa 1 - João
        { conversationId: conv1.id, role: 'system', text: 'Cliente interessado em musculação' },
        { conversationId: conv1.id, role: 'user', text: 'Oi! Quero começar a malhar, vocês têm personal trainer?' },
        { conversationId: conv1.id, role: 'assistant', text: 'Olá João! Sim, temos excelentes personal trainers! 💪 Qual seu objetivo principal: ganho de massa muscular, definição ou condicionamento físico?' },
        
        // Conversa 2 - Paulo
        { conversationId: conv2.id, role: 'system', text: 'Cliente interessado em natação' },
        { conversationId: conv2.id, role: 'user', text: 'Boa tarde! Vocês têm piscina?' },
        { conversationId: conv2.id, role: 'assistant', text: 'Boa tarde Paulo! 🏊‍♂️ Sim, temos uma piscina olímpica! Oferecemos aulas de natação para todos os níveis. Você já pratica ou é iniciante?' },
        
        // Conversa 3 - Maria
        { conversationId: conv3.id, role: 'system', text: 'Cliente interessada em pilates' },
        { conversationId: conv3.id, role: 'user', text: 'Oi! Vocês têm aulas de pilates?' },
        { conversationId: conv3.id, role: 'assistant', text: 'Oi Maria! 🧘‍♀️ Temos aulas de pilates todos os dias! Oferecemos pilates clássico, pilates com aparelhos e pilates funcional. Qual você prefere?' },
        
        // Conversa 4 - Carlos
        { conversationId: conv4.id, role: 'system', text: 'Cliente querendo personal trainer' },
        { conversationId: conv4.id, role: 'user', text: 'Preciso de um personal trainer urgente!' },
        { conversationId: conv4.id, role: 'assistant', text: 'Entendi Carlos! 🏃‍♂️ Nossos personal trainers estão prontos para te ajudar! Qual seu horário preferido e objetivo específico?' },
        
        // Conversa 5 - Ana
        { conversationId: conv5.id, role: 'system', text: 'Cliente interessada em crossfit' },
        { conversationId: conv5.id, role: 'user', text: 'Olá! Vocês têm crossfit?' },
        { conversationId: conv5.id, role: 'assistant', text: 'Olá Ana! 💪 Sim, temos aulas de CrossFit! Nossos treinos são intensos e variados. Você já praticou antes ou é iniciante?' }
      ]
    });

    // Mensagens para Colavouro
    await prisma.message.createMany({
      data: [
        // Conversa 6 - Roberto
        { conversationId: conv6.id, role: 'system', text: 'Cliente interessado em consultoria' },
        { conversationId: conv6.id, role: 'user', text: 'Bom dia! Preciso de consultoria para minha empresa' },
        { conversationId: conv6.id, role: 'assistant', text: 'Bom dia Roberto! A Colavouro oferece consultoria empresarial completa. Qual área específica você gostaria de melhorar: gestão, processos, tecnologia ou estratégia?' },
        
        // Conversa 7 - Fernanda
        { conversationId: conv7.id, role: 'system', text: 'Cliente interessada em sistema de gestão' },
        { conversationId: conv7.id, role: 'user', text: 'Olá! Vocês desenvolvem sistemas de gestão?' },
        { conversationId: conv7.id, role: 'assistant', text: 'Olá Fernanda! Sim, desenvolvemos sistemas de gestão personalizados. Qual tipo de sistema você precisa: ERP, CRM, controle de estoque ou sistema específico para sua área?' },
        
        // Conversa 8 - Lucas
        { conversationId: conv8.id, role: 'system', text: 'Cliente interessado em automação' },
        { conversationId: conv8.id, role: 'user', text: 'Oi! Vocês fazem automação de processos?' },
        { conversationId: conv8.id, role: 'assistant', text: 'Oi Lucas! 🤖 Sim, somos especialistas em automação de processos! Podemos automatizar desde tarefas simples até workflows complexos. Qual processo você gostaria de automatizar?' },
        
        // Conversa 9 - Juliana
        { conversationId: conv9.id, role: 'system', text: 'Cliente interessada em treinamento' },
        { conversationId: conv9.id, role: 'user', text: 'Boa tarde! Vocês oferecem treinamentos corporativos?' },
        { conversationId: conv9.id, role: 'assistant', text: 'Boa tarde Juliana! 📚 Sim, oferecemos treinamentos corporativos personalizados! Cobrimos áreas como liderança, vendas, tecnologia e gestão. Qual área sua equipe precisa desenvolver?' },
        
        // Conversa 10 - Pedro
        { conversationId: conv10.id, role: 'system', text: 'Cliente interessado em consultoria financeira' },
        { conversationId: conv10.id, role: 'user', text: 'Olá! Vocês fazem consultoria financeira?' },
        { conversationId: conv10.id, role: 'assistant', text: 'Olá Pedro! 💰 Sim, oferecemos consultoria financeira especializada! Ajudamos com planejamento, análise de custos, otimização de recursos e estratégias financeiras. Qual é o foco da sua necessidade?' }
      ]
    });

    console.log('Seeded tenants/users/prompts/conversation.');
  } else {
    console.log('Global prompts ensured; skipping sample data.');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
