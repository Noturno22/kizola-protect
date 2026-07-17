#!/usr/bin/env node
/**
 * Merges translated strings from _en_source.json into target language files.
 * Usage: node scripts/merge-translations.js <lang> (pt or fr)
 */

const fs = require('fs');
const path = require('path');

const lang = process.argv[2];
if (!lang || !['pt', 'fr'].includes(lang)) {
  console.error('Usage: node merge-translations.js <pt|fr>');
  process.exit(1);
}

const translationsDir = path.join(__dirname, '..', 'assets', 'translations');
const sourcePath = path.join(translationsDir, '_en_source.json');
const targetPath = path.join(translationsDir, `${lang}.json`);

// Read source and target
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const target = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

// ============================================================
// TRANSLATIONS MAP - key -> translated value
// ============================================================

const translations = {};

if (lang === 'pt') {
  // ===== BENEFITS SECTION =====
  translations['benefits.title'] = 'Os Seus Benefícios';
  translations['benefits.subtitle'] = 'Explore todos os serviços oferecidos exclusivamente para si.';
  translations['benefits.categories'] = 'Categorias de Benefícios';
  translations['benefits.viewDetails'] = 'Ver Detalhes';
  translations['benefits.allServices'] = 'Todos os Serviços';
  translations['benefits.servicesCount'] = 'serviços';
  translations['benefits.bikeLoanTitle'] = 'Empréstimos até 6.5%';
  translations['benefits.bikeLoanDesc'] = 'Após 2 anos de contribuição direta, solicite um empréstimo até 6.5% para alugar uma bicicleta 🚲 ou dar entrada numa bicicleta 🚲 diretamente na aplicação.';
  translations['benefits.newBadge'] = 'Novo';
  translations['benefits.ctaTitle'] = 'Quer mais benefícios?';
  translations['benefits.ctaDesc'] = 'Faça upgrade para Premium para acesso ilimitado';
  translations['benefits.upgrade'] = 'Upgrade';
  translations['benefits.whatsIncluded'] = 'O que está Incluído';
  translations['benefits.requestAssistance'] = 'Pedir Assistência';
  translations['benefits.requestService'] = 'Pedir Este Serviço';
  translations['benefits.newServices'] = 'Novos Serviços';
  translations['benefits.housingSupport'] = 'Apoio à Habitação';
  translations['benefits.housingSupportDesc'] = 'Procura de habitação, abrigo e programas habitacionais';
  translations['benefits.financeHelp'] = 'Ajuda Financeira';
  translations['benefits.financeHelpDesc'] = 'EBT, benefícios estaduais, impostos e IRS';

  // categories_list.legal
  translations['benefits.categories_list.legal.title'] = 'Apoio Jurídico';
  translations['benefits.categories_list.legal.description'] = 'Aceda a orientação jurídica profissional através da nossa rede de parceiros. Obtenha ajuda com revisão de documentos, consultas jurídicas e encaminhamento para advogados qualificados.';
  translations['benefits.categories_list.legal.features'] = [
    'Revisão de documentos legais',
    'Acesso a consultas básicas',
    'Encaminhamento para advogados',
    'Educação sobre direitos'
  ];

  // categories_list.immigration
  translations['benefits.categories_list.immigration.title'] = 'Assistência à Imigração';
  translations['benefits.categories_list.immigration.description'] = 'Navegue pelo complexo sistema de imigração com orientação especializada. De pedidos de visto a processos de cidadania, estamos aqui para ajudar.';
  translations['benefits.categories_list.immigration.features'] = [
    'Orientação para pedidos de visto',
    'Apoio ao Green Card',
    'Ajuda no processo de cidadania',
    'Preparação de documentos'
  ];

  // categories_list.housing
  translations['benefits.categories_list.housing.title'] = 'Apoio à Habitação';
  translations['benefits.categories_list.housing.description'] = 'Encontre habitação estável e compreenda os seus direitos como inquilino. Aceda a recursos para assistência no arrendamento, abrigo e programas de habitação acessível.';
  translations['benefits.categories_list.housing.features'] = [
    'Ajuda na candidatura ao arrendamento',
    'Orientação sobre direitos do inquilino',
    'Recursos de habitação acessível',
    'Acesso a abrigo de emergência'
  ];

  // categories_list.tax
  translations['benefits.categories_list.tax.title'] = 'Serviços Fiscais';
  translations['benefits.categories_list.tax.description'] = 'Maximize os seus reembolsos e mantenha-se em conformidade com assistência fiscal profissional. Os nossos parceiros ajudam com declarações, deduções e planeamento fiscal.';
  translations['benefits.categories_list.tax.features'] = [
    'Preparação de declaração de impostos',
    'Otimização de deduções',
    'Ajuda com correspondência fiscal',
    'Orientação de planeamento fiscal'
  ];

  // categories_list.education
  translations['benefits.categories_list.education.title'] = 'Educação e Carreira';
  translations['benefits.categories_list.education.description'] = 'Avance na sua educação e carreira com orientação para bolsas de estudo, revisão de currículos e recursos de desenvolvimento profissional.';
  translations['benefits.categories_list.education.features'] = [
    'Assistência na procura de bolsas',
    'Revisão de currículo e carta de apresentação',
    'Preparação para entrevistas',
    'Sessões de coaching de carreira'
  ];

  // categories_list.emergency
  translations['benefits.categories_list.emergency.title'] = 'Assistência de Emergência';
  translations['benefits.categories_list.emergency.description'] = 'Acesso 24/7 a redes de apoio de emergência. Obtenha ajuda imediata durante crises, incluindo habitação, alimentação e intervenção em crises.';
  translations['benefits.categories_list.emergency.features'] = [
    'Linha direta de crise 24/7',
    'Habitação de emergência',
    'Assistência alimentar',
    'Intervenção em crises'
  ];

  // items
  translations['benefits.items.legal.title'] = 'Orientação Jurídica';
  translations['benefits.items.legal.description'] = 'Acesso a consultas e orientação jurídica para questões comuns. A nossa rede de parceiros fornece aconselhamento jurídico básico, revisão de documentos e encaminhamento para advogados qualificados quando necessário.';
  translations['benefits.items.legal.category_name'] = 'Jurídico';

  translations['benefits.items.immigration.title'] = 'Apoio à Imigração';
  translations['benefits.items.immigration.description'] = 'Navegue no sistema de imigração com confiança. Obtenha ajuda com formulários, compreenda os seus direitos e receba orientação sobre vistos, green cards e processos de cidadania.';
  translations['benefits.items.immigration.category_name'] = 'Imigração';

  translations['benefits.items.tax.title'] = 'Assistência na Declaração de Impostos';
  translations['benefits.items.tax.description'] = 'Ajuda especializada na preparação e entrega de impostos. Os nossos especialistas fiscais auxiliam com declarações individuais, deduções, créditos e garantem que maximiza o seu reembolso mantendo-se em conformidade.';
  translations['benefits.items.tax.category_name'] = 'Finanças';

  translations['benefits.items.housing.title'] = 'Apoio à Habitação';
  translations['benefits.items.housing.description'] = 'Encontre soluções de habitação e compreenda os seus direitos de inquilino. Obtenha assistência com candidaturas ao arrendamento, recursos de abrigo e orientação sobre programas de habitação acessível.';
  translations['benefits.items.housing.category_name'] = 'Habitação';

  translations['benefits.items.education.title'] = 'Educação e Bolsas';
  translations['benefits.items.education.description'] = 'Desbloqueie oportunidades educacionais com orientação sobre bolsas, ajuda financeira e processos de inscrição. Ajudamo-lo a encontrar recursos para avançar na sua educação.';
  translations['benefits.items.education.category_name'] = 'Educação';

  translations['benefits.items.job.title'] = 'Trabalho e Emprego';
  translations['benefits.items.job.description'] = 'Acelere a sua carreira com revisões de currículos, preparação para entrevistas e estratégias de procura de emprego. Ligue-se a recursos de emprego e oportunidades de formação.';
  translations['benefits.items.job.category_name'] = 'Carreira';

  translations['benefits.items.emergency.title'] = 'Assistência de Emergência';
  translations['benefits.items.emergency.description'] = 'Acesso 24/7 a redes de apoio de emergência. Obtenha ajuda imediata durante crises, incluindo habitação de emergência, assistência alimentar e recursos de intervenção em crises.';
  translations['benefits.items.emergency.category_name'] = 'Emergência';

  translations['benefits.items.recovery.title'] = 'Recuperação de Contas';
  translations['benefits.items.recovery.description'] = 'Recupere o acesso à sua vida digital. Ajudamos a recuperar contas bloqueadas ou pirateadas da Uber, DoorDash e outras plataformas de serviços essenciais.';
  translations['benefits.items.recovery.category_name'] = 'Digital';

  // ===== LEARN SECTION =====
  translations['learn.title'] = 'Centro de Aprendizagem';
  translations['learn.subtitle'] = 'Recursos educativos para ajudar a lidar com os desafios da vida';
  translations['learn.all'] = 'Todos';
  translations['learn.articles_stat'] = 'Artigos';
  translations['learn.categories_stat'] = 'Categorias';
  translations['learn.category_tax'] = 'Impostos';
  translations['learn.category_immigration'] = 'Imigração';
  translations['learn.category_housing'] = 'Habitação';
  translations['learn.category_legal'] = 'Jurídico';
  translations['learn.category_career'] = 'Carreira';
  translations['learn.category_health'] = 'Saúde';
  translations['learn.category_finance'] = 'Finanças';
  translations['learn.category_education'] = 'Educação';
  translations['learn.category_safety'] = 'Segurança';
  translations['learn.category_community'] = 'Comunidade';
  translations['learn.category_work'] = 'Trabalho';
  translations['learn.avgRead'] = 'Tempo Médio';
  translations['learn.featuredArticle'] = 'Artigo em Destaque';
  translations['learn.dailyTip'] = 'Dica do Dia';
  translations['learn.readNow'] = 'Ler agora';
  translations['learn.allArticles'] = 'Todos os Artigos';
  translations['learn.articlesCount'] = 'artigos';
  translations['learn.minRead'] = 'min leitura';
  translations['learn.needHelp'] = 'Precisa de ajuda personalizada?';
  translations['learn.helpDesc'] = 'A nossa equipa de suporte pode fornecer orientação adaptada à sua situação';
  translations['learn.contactSupport'] = 'Contactar Suporte';
  translations['learn.helpTopic'] = 'Precisa de ajuda com este tópico?';
  translations['learn.popular'] = 'Popular';
  translations['learn.recent'] = 'Recentes';
  translations['learn.recommended'] = 'Recomendado para Si';
  translations['learn.saved'] = 'Os Seus Artigos Guardados';
  translations['learn.noSaved'] = 'Ainda não tem artigos guardados';
  translations['learn.sortBy'] = 'Ordenar por';
  translations['learn.sortRecent'] = 'Mais Recentes';
  translations['learn.sortPopular'] = 'Mais Populares';
  translations['learn.sortAZ'] = 'A-Z';
  translations['learn.sortReadTime'] = 'Tempo de Leitura';
  translations['learn.filters'] = 'Filtros';
  translations['learn.clearFilters'] = 'Limpar Tudo';
  translations['learn.applyFilters'] = 'Aplicar Filtros';
  translations['learn.difficulty'] = 'Dificuldade';
  translations['learn.beginner'] = 'Iniciante';
  translations['learn.intermediate'] = 'Intermédio';
  translations['learn.advanced'] = 'Avançado';
  translations['learn.readTime'] = 'Tempo de Leitura';
  translations['learn.under5'] = 'Menos de 5 min';
  translations['learn.fiveTo10'] = '5-10 min';
  translations['learn.over10'] = 'Mais de 10 min';
  translations['learn.relatedArticles'] = 'Artigos Relacionados';
  translations['learn.bookmarked'] = 'Guardado';
  translations['learn.shareArticle'] = 'Partilhar Artigo';
  translations['learn.noResults'] = 'Nenhum artigo encontrado';
  translations['learn.tryDifferent'] = 'Tente outros termos de pesquisa ou filtros';
  translations['learn.tryDifferentFilters'] = 'Tente outros termos de pesquisa ou filtros';
  translations['learn.min'] = 'min';

  // Article titles and descriptions
  translations['learn.articles.tax.1.title'] = 'Básicos da Declaração de Impostos';
  translations['learn.articles.tax.1.description'] = 'Guia essencial para compreender os requisitos de declaração de impostos, prazos e deduções a que pode ter direito.';
  translations['learn.articles.tax.2.title'] = 'Deduções Comuns de Impostos';
  translations['learn.articles.tax.2.description'] = 'Maximize o seu reembolso compreendendo a que deduções e créditos tem direito como imigrante.';
  translations['learn.articles.tax.3.title'] = 'Declaração de Impostos como Trabalhador Independente';
  translations['learn.articles.tax.3.description'] = 'Se trabalha por conta própria, conduz para plataformas de transporte ou gere um pequeno negócio, este guia cobre as suas obrigações fiscais específicas.';
  translations['learn.articles.tax.4.title'] = 'Compreender os Reembolsos de Impostos';
  translations['learn.articles.tax.4.description'] = 'Saiba como funcionam os reembolsos de impostos, como maximizar o seu e como acompanhar o estado do seu reembolso.';
  translations['learn.articles.tax.5.title'] = 'Guia de Impostos Estaduais';
  translations['learn.articles.tax.5.description'] = 'Nem todos os estados têm imposto sobre rendimentos. Saiba quais os estados que o tributam e como entregar as declarações estaduais.';

  translations['learn.articles.immigration.1.title'] = 'Visão Geral dos Tipos de Visto';
  translations['learn.articles.immigration.1.description'] = 'Um guia abrangente das categorias de visto mais comuns nos EUA para trabalho, família e estudo.';
  translations['learn.articles.immigration.2.title'] = 'Processo do Green Card';
  translations['learn.articles.immigration.2.description'] = 'Guia passo a passo para obter residência permanente através de família, emprego ou outras vias.';
  translations['learn.articles.immigration.3.title'] = 'Caminho para a Cidadania';
  translations['learn.articles.immigration.3.description'] = 'Compreender o processo de naturalização de residente permanente a cidadão dos EUA.';
  translations['learn.articles.immigration.4.title'] = 'Compreender o DACA';
  translations['learn.articles.immigration.4.description'] = 'O que é o DACA, quem é elegível, estado atual e alternativas disponíveis para Dreamers.';
  translations['learn.articles.immigration.5.title'] = 'Guia de Autorização de Trabalho';
  translations['learn.articles.immigration.5.description'] = 'Como obter e manter a autorização de trabalho nos EUA, incluindo cartões EAD e patrocínio de empregadores.';

  translations['learn.articles.housing.1.title'] = 'Visão Geral dos Direitos do Inquilino';
  translations['learn.articles.housing.1.description'] = 'Conheça os seus direitos como inquilino nos EUA, desde padrões de habitabilidade até proteção contra discriminação.';
  translations['learn.articles.housing.2.title'] = 'Compreender os Contratos de Arrendamento';
  translations['learn.articles.housing.2.description'] = 'O que procurar no seu contrato, os seus direitos e obrigações, e cláusulas comuns a ter em atenção.';
  translations['learn.articles.housing.3.title'] = 'Proteção Contra Despejo';
  translations['learn.articles.housing.3.description'] = 'Compreender o processo de despejo, os seus direitos durante o despejo e como combater despejos ilegais.';
  translations['learn.articles.housing.4.title'] = 'Guia do Depósito de Segurança';
  translations['learn.articles.housing.4.description'] = 'Como funcionam os depósitos de segurança, o que os senhorios podem deduzir e como recuperar o seu dinheiro.';
  translations['learn.articles.housing.5.title'] = 'Leis de Habitação Justa';
  translations['learn.articles.housing.5.description'] = 'Proteção contra discriminação habitacional com base em raça, religião, origem nacional e outras características.';

  translations['learn.articles.legal.1.title'] = 'Quando Contratar um Advogado';
  translations['learn.articles.legal.1.description'] = 'Compreender quando a representação jurídica é essencial e como encontrar advogados acessíveis.';
  translations['learn.articles.legal.2.title'] = 'Recursos de Assistência Jurídica Gratuita';
  translations['learn.articles.legal.2.description'] = 'Onde encontrar assistência jurídica gratuita ou de baixo custo na sua comunidade.';
  translations['learn.articles.legal.3.title'] = 'Conheça os Seus Direitos';
  translations['learn.articles.legal.3.description'] = 'Direitos essenciais que o protegem durante interações com a polícia, ICE e na vida diária.';
  translations['learn.articles.legal.4.title'] = 'Tratar de Multas de Trânsito';
  translations['learn.articles.legal.4.description'] = 'O que fazer se receber uma multa de trânsito, as suas opções e como proteger o seu registo de condução.';
  translations['learn.articles.legal.5.title'] = 'Noções Básicas de Direito do Trabalho';
  translations['learn.articles.legal.5.description'] = 'Os seus direitos no local de trabalho, desde o salário mínimo até proteções de segurança e leis contra a discriminação.';

  translations['learn.articles.career.1.title'] = 'Guia de Construção de Currículo';
  translations['learn.articles.career.1.description'] = 'Crie um currículo profissional que lhe consiga entrevistas, com modelos e dicas para imigrantes.';
  translations['learn.articles.career.2.title'] = 'Preparação para Entrevistas';
  translations['learn.articles.career.2.description'] = 'Domine a arte da entrevista, desde perguntas comuns até estratégias de acompanhamento.';
  translations['learn.articles.career.3.title'] = 'Estratégias de Networking';
  translations['learn.articles.career.3.description'] = 'Construa ligações profissionais que levam a oportunidades de emprego e crescimento de carreira.';
  translations['learn.articles.career.4.title'] = 'Otimização do LinkedIn';
  translations['learn.articles.career.4.description'] = 'Construa um perfil de LinkedIn poderoso que atrai recrutadores e oportunidades.';
  translations['learn.articles.career.5.title'] = 'Guia de Mudança de Carreira';
  translations['learn.articles.career.5.description'] = 'Como transitar com sucesso para um novo campo de carreira, da avaliação à execução.';

  translations['learn.articles.health.1.title'] = 'Noções Básicas de Seguro de Saúde';
  translations['learn.articles.health.1.description'] = 'Compreender o sistema de seguro de saúde dos EUA, incluindo planos do marketplace e cobertura de empregadores.';
  translations['learn.articles.health.2.title'] = 'Compreender o Medicaid';
  translations['learn.articles.health.2.description'] = 'Elegibilidade, benefícios e como solicitar cobertura do Medicaid e CHIP.';
  translations['learn.articles.health.3.title'] = 'Guia de Cuidados de Emergência';
  translations['learn.articles.health.3.description'] = 'O que fazer numa emergência médica, os seus direitos na urgência e como gerir custos médicos de emergência.';
  translations['learn.articles.health.4.title'] = 'Recursos de Saúde Mental';
  translations['learn.articles.health.4.description'] = 'Aceder a serviços de saúde mental, terapia e aconselhamento, incluindo recursos para imigrantes.';
  translations['learn.articles.health.5.title'] = 'Encontrar um Médico';
  translations['learn.articles.health.5.description'] = 'Como encontrar o médico de família adequado, compreender a relação médico-doente e navegar no sistema de saúde.';

  translations['learn.articles.finance.1.title'] = 'Noções Básicas de Banca';
  translations['learn.articles.finance.1.description'] = 'Como abrir uma conta bancária, escolher o banco certo e gerir o seu dinheiro no sistema bancário dos EUA.';
  translations['learn.articles.finance.2.title'] = 'Compreender o Score de Crédito';
  translations['learn.articles.finance.2.description'] = 'O que é o score de crédito, como afeta a sua vida e como construir e melhorar o seu.';
  translations['learn.articles.finance.3.title'] = 'Guia de Orçamentação';
  translations['learn.articles.finance.3.description'] = 'Crie e mantenha um orçamento pessoal que funcione para os seus rendimentos e objetivos.';
  translations['learn.articles.finance.4.title'] = 'Enviar Dinheiro para o Estrangeiro';
  translations['learn.articles.finance.4.description'] = 'Compare serviços e métodos para transferências internacionais de dinheiro, minimizando custos e maximizando o valor.';
  translations['learn.articles.finance.5.title'] = 'Gerir Dívidas';
  translations['learn.articles.finance.5.description'] = 'Estratégias para pagar dívidas, evitar empréstimos predatórios e construir liberdade financeira.';

  translations['learn.articles.education.1.title'] = 'Programas de ESL';
  translations['learn.articles.education.1.description'] = 'Encontre aulas de inglês, desde programas comunitários gratuitos até plataformas de aprendizagem online.';
  translations['learn.articles.education.2.title'] = 'Preparação para o GED';
  translations['learn.articles.education.2.description'] = 'Obtenha o diploma de equivalência ao ensino secundário através do teste GED, com recursos de estudo e dicas.';
  translations['learn.articles.education.3.title'] = 'Bolsas de Estudo Universitárias';
  translations['learn.articles.education.3.description'] = 'Encontre e candidate-se a bolsas, subsídios e ajuda financeira para financiar a sua educação.';
  translations['learn.articles.education.4.title'] = 'Plataformas de Aprendizagem Online';
  translations['learn.articles.education.4.description'] = 'As melhores plataformas para aprender novas competências, obter certificados e avançar na sua carreira online.';
  translations['learn.articles.education.5.title'] = 'Guia de Escolas Profissionais';
  translations['learn.articles.education.5.description'] = 'Opções de formação profissional e escolas profissionais para carreiras de alta procura com períodos de formação mais curtos.';

  translations['learn.articles.safety.1.title'] = 'Prevenção de Fraudes';
  translations['learn.articles.safety.1.description'] = 'Reconheça e evite fraudes comuns que visam imigrantes, desde telefones falsos a serviços falsos.';
  translations['learn.articles.safety.2.title'] = 'Recursos de Violência Doméstica';
  translations['learn.articles.safety.2.description'] = 'Planeamento de segurança, recursos e proteções legais para vítimas de violência doméstica.';
  translations['learn.articles.safety.3.title'] = 'Conheça os Seus Direitos: Interações com ICE';
  translations['learn.articles.safety.3.description'] = 'O que fazer se a ICE vier à sua casa, local de trabalho ou se for abordado em público.';
  translations['learn.articles.safety.4.title'] = 'Planeamento de Emergência';
  translations['learn.articles.safety.4.description'] = 'Crie um plano de emergência familiar que o prepare para desastres naturais, separação ou situações de crise.';
  translations['learn.articles.safety.5.title'] = 'Guia de Segurança Online';
  translations['learn.articles.safety.5.description'] = 'Proteja-se de fraudes online, furto de identidade e ameaças à privacidade digital.';

  translations['learn.articles.community.1.title'] = 'Adaptação Cultural';
  translations['learn.articles.community.1.description'] = 'Navegar o choque cultural, adaptar-se aos costumes americanos e manter a sua identidade cultural.';
  translations['learn.articles.community.2.title'] = 'Encontrar a Sua Comunidade';
  translations['learn.articles.community.2.description'] = 'Como construir uma rede social, encontrar grupos de apoio e criar pertença no seu novo lar.';
  translations['learn.articles.community.3.title'] = 'Intercâmbio de Línguas';
  translations['learn.articles.community.3.description'] = 'Encontre parceiros e programas de intercâmbio de línguas para melhorar o seu inglês enquanto partilha a sua língua.';
  translations['learn.articles.community.4.title'] = 'Recursos Baseados na Fé';
  translations['learn.articles.community.4.description'] = 'Encontre comunidades religiosas e organizações baseadas na fé que apoiem imigrantes.';
  translations['learn.articles.community.5.title'] = 'Oportunidades de Voluntariado';
  translations['learn.articles.community.5.description'] = 'Retribua à sua comunidade enquanto desenvolve competências, ligações e experiência.';

  translations['learn.articles.work.1.title'] = 'Direitos dos Trabalhadores da Gig Economy';
  translations['learn.articles.work.1.description'] = 'Compreender os seus direitos como trabalhador da gig economy, incluindo transporte, entregas e trabalho independente.';
  translations['learn.articles.work.2.title'] = 'Leis Laborais dos EUA';
  translations['learn.articles.work.2.description'] = 'Compreender o salário mínimo, horas extras, pausas e outras proteções no local de trabalho sob lei federal e estadual.';
  translations['learn.articles.work.3.title'] = 'Prevenção de Roubo Salarial';
  translations['learn.articles.work.3.description'] = 'Reconhecer e recuperar salários roubados, e como denunciar empregadores que não pagam justamente.';
  translations['learn.articles.work.4.title'] = 'Compreender os Sindicatos';
  translations['learn.articles.work.4.description'] = 'O que são os sindicatos, como protegem os trabalhadores e como organizar ou entrar num no seu local de trabalho.';
  translations['learn.articles.work.5.title'] = 'Guia de Autorização de Trabalho';
  translations['learn.articles.work.5.description'] = 'Guia abrangente para manter a autorização de trabalho, mudar de empregador e requisitos de conformidade.';
}

if (lang === 'fr') {
  // ===== BENEFITS SECTION =====
  translations['benefits.title'] = 'Vos Avantages';
  translations['benefits.subtitle'] = 'Explorez tous les services offerts exclusivement pour vous.';
  translations['benefits.categories'] = 'Catégories d\'Avantages';
  translations['benefits.viewDetails'] = 'Voir les Détails';
  translations['benefits.allServices'] = 'Tous les Services';
  translations['benefits.servicesCount'] = 'services';
  translations['benefits.bikeLoanTitle'] = 'Prêts jusqu\'à 6.5%';
  translations['benefits.bikeLoanDesc'] = 'Après 2 ans de contribution directe, demandez un prêt jusqu\'à 6.5% pour louer un vélo 🚲 ou faire un acompte pour un vélo 🚲 directement dans l\'application.';
  translations['benefits.newBadge'] = 'Nouveau';
  translations['benefits.ctaTitle'] = 'Vous voulez plus d\'avantages ?';
  translations['benefits.ctaDesc'] = 'Passez au Premium pour un accès illimité';
  translations['benefits.upgrade'] = 'Mettre à niveau';
  translations['benefits.whatsIncluded'] = 'Ce qui est Inclus';
  translations['benefits.requestAssistance'] = 'Demander de l\'Assistance';
  translations['benefits.requestService'] = 'Demander ce Service';
  translations['benefits.newServices'] = 'Nouveaux Services';
  translations['benefits.housingSupport'] = 'Soutien au Logement';
  translations['benefits.housingSupportDesc'] = 'Recherche de logement, hébergement et programmes d\'habitation';
  translations['benefits.financeHelp'] = 'Aide Financière';
  translations['benefits.financeHelpDesc'] = 'EBT, prestations étatiques, impôts et IRS';

  // categories_list.legal
  translations['benefits.categories_list.legal.title'] = 'Soutien Juridique';
  translations['benefits.categories_list.legal.description'] = 'Accédez à une orientation juridique professionnelle grâce à notre réseau de partenaires. Obtenez de l\'aide pour la révision de documents, des consultations juridiques et des recommandations d\'avocats qualifiés.';
  translations['benefits.categories_list.legal.features'] = [
    'Révision de documents juridiques',
    'Accès à des consultations de base',
    'Recommandations d\'avocats',
    'Éducation sur les droits'
  ];

  // categories_list.immigration
  translations['benefits.categories_list.immigration.title'] = 'Assistance à l\'Immigration';
  translations['benefits.categories_list.immigration.description'] = 'Naviguez dans le système complexe de l\'immigration avec des conseils d\'experts. Des demandes de visa aux processus de citoyenneté, nous sommes là pour vous aider.';
  translations['benefits.categories_list.immigration.features'] = [
    'Conseils pour les demandes de visa',
    'Soutien pour la Green Card',
    'Aide au processus de citoyenneté',
    'Préparation de documents'
  ];

  // categories_list.housing
  translations['benefits.categories_list.housing.title'] = 'Soutien au Logement';
  translations['benefits.categories_list.housing.description'] = 'Trouvez un logement stable et comprenez vos droits en tant que locataire. Accédez à des ressources pour l\'aide à la location, l\'hébergement et les programmes de logement abordable.';
  translations['benefits.categories_list.housing.features'] = [
    'Aide à la demande de location',
    'Conseils sur les droits des locataires',
    'Ressources de logement abordable',
    'Accès à l\'hébergement d\'urgence'
  ];

  // categories_list.tax
  translations['benefits.categories_list.tax.title'] = 'Services Fiscaux';
  translations['benefits.categories_list.tax.description'] = 'Maximisez vos remboursements et restez en conformité avec une assistance fiscale professionnelle. Nos partenaires vous aident pour les déclarations, les déductions et la planification fiscale.';
  translations['benefits.categories_list.tax.features'] = [
    'Préparation de la déclaration de revenus',
    'Optimisation des déductions',
    'Aide à la correspondance fiscale',
    'Conseils en planification fiscale'
  ];

  // categories_list.education
  translations['benefits.categories_list.education.title'] = 'Éducation et Carrière';
  translations['benefits.categories_list.education.description'] = 'Faites progresser votre éducation et votre carrière avec des conseils sur les bourses d\'études, la révision de CV et des ressources de développement professionnel.';
  translations['benefits.categories_list.education.features'] = [
    'Aide à la recherche de bourses',
    'Révision de CV et lettre de motivation',
    'Préparation aux entretiens',
    'Séances de coaching de carrière'
  ];

  // categories_list.emergency
  translations['benefits.categories_list.emergency.title'] = 'Assistance d\'Urgence';
  translations['benefits.categories_list.emergency.description'] = 'Accès 24h/24 et 7j/7 aux réseaux de soutien d\'urgence. Obtenez une aide immédiate en cas de crise, notamment pour le logement, la nourriture et l\'intervention en cas de crise.';
  translations['benefits.categories_list.emergency.features'] = [
    'Ligne d\'urgence 24h/24 et 7j/7',
    'Logement d\'urgence',
    'Assistance alimentaire',
    'Intervention en cas de crise'
  ];

  // items
  translations['benefits.items.legal.title'] = 'Orientation Juridique';
  translations['benefits.items.legal.description'] = 'Accès à des consultations et des conseils juridiques pour les problèmes courants. Notre réseau de partenaires fournit des conseils juridiques de base, la révision de documents et des recommandations d\'avocats qualifiés si nécessaire.';
  translations['benefits.items.legal.category_name'] = 'Juridique';

  translations['benefits.items.immigration.title'] = 'Soutien à l\'Immigration';
  translations['benefits.items.immigration.description'] = 'Naviguez dans le système d\'immigration en toute confiance. Obtenez de l\'aide pour les formulaires, comprenez vos droits et recevez des conseils sur les visas, les cartes vertes et les processus de citoyenneté.';
  translations['benefits.items.immigration.category_name'] = 'Immigration';

  translations['benefits.items.tax.title'] = 'Aide à la Déclaration de Revenus';
  translations['benefits.items.tax.description'] = 'Aide experte pour la préparation et le dépôt des déclarations de revenus. Nos spécialistes fiscaux vous aident pour les déclarations individuelles, les déductions, les crédits et s\'assurent que vous maximisez votre remboursement tout en restant en conformité.';
  translations['benefits.items.tax.category_name'] = 'Finance';

  translations['benefits.items.housing.title'] = 'Soutien au Logement';
  translations['benefits.items.housing.description'] = 'Trouvez des solutions de logement et comprenez vos droits de locataire. Obtenez de l\'aide pour les demandes de location, les ressources d\'hébergement et des conseils sur les programmes de logement abordable.';
  translations['benefits.items.housing.category_name'] = 'Logement';

  translations['benefits.items.education.title'] = 'Éducation et Bourses';
  translations['benefits.items.education.description'] = 'Débloquez des opportunités éducatives avec des conseils sur les bourses, l\'aide financière et les processus d\'inscription. Nous vous aidons à trouver des ressources pour progresser dans votre éducation.';
  translations['benefits.items.education.category_name'] = 'Éducation';

  translations['benefits.items.job.title'] = 'Travail et Emploi';
  translations['benefits.items.job.description'] = 'Accélérez votre carrière avec des révisions de CV, une préparation aux entretiens et des stratégies de recherche d\'emploi. Connectez-vous aux ressources d\'emploi et aux opportunités de formation.';
  translations['benefits.items.job.category_name'] = 'Carrière';

  translations['benefits.items.emergency.title'] = 'Assistance d\'Urgence';
  translations['benefits.items.emergency.description'] = 'Accès 24h/24 et 7j/7 aux réseaux de soutien d\'urgence. Obtenez une aide immédiate en cas de crise, notamment pour le logement d\'urgence, l\'assistance alimentaire et les ressources d\'intervention en cas de crise.';
  translations['benefits.items.emergency.category_name'] = 'Urgence';

  translations['benefits.items.recovery.title'] = 'Récupération de Compte';
  translations['benefits.items.recovery.description'] = 'Retrouvez l\'accès à votre vie numérique. Nous vous aidons à récupérer des comptes bloqués ou piratés pour Uber, DoorDash et d\'autres plateformes de services essentiels.';
  translations['benefits.items.recovery.category_name'] = 'Numérique';

  // ===== LEARN SECTION =====
  translations['learn.title'] = 'Centre d\'Apprentissage';
  translations['learn.subtitle'] = 'Ressources éducatives pour vous aider à relever les défis de la vie';
  translations['learn.all'] = 'Tout';
  translations['learn.articles_stat'] = 'Articles';
  translations['learn.categories_stat'] = 'Catégories';
  translations['learn.category_tax'] = 'Impôts';
  translations['learn.category_immigration'] = 'Immigration';
  translations['learn.category_housing'] = 'Logement';
  translations['learn.category_legal'] = 'Juridique';
  translations['learn.category_career'] = 'Carrière';
  translations['learn.category_health'] = 'Santé';
  translations['learn.category_finance'] = 'Finance';
  translations['learn.category_education'] = 'Éducation';
  translations['learn.category_safety'] = 'Sécurité';
  translations['learn.category_community'] = 'Communauté';
  translations['learn.category_work'] = 'Travail';
  translations['learn.avgRead'] = 'Temps Moyen';
  translations['learn.featuredArticle'] = 'Article en Vedette';
  translations['learn.dailyTip'] = 'Conseil du Jour';
  translations['learn.readNow'] = 'Lire maintenant';
  translations['learn.allArticles'] = 'Tous les Articles';
  translations['learn.articlesCount'] = 'articles';
  translations['learn.minRead'] = 'min de lecture';
  translations['learn.needHelp'] = 'Besoin d\'aide personnalisée ?';
  translations['learn.helpDesc'] = 'Notre équipe de support peut fournir des conseils adaptés à votre situation';
  translations['learn.contactSupport'] = 'Contacter le Support';
  translations['learn.helpTopic'] = 'Besoin d\'aide avec ce sujet ?';
  translations['learn.popular'] = 'Populaire';
  translations['learn.recent'] = 'Récents';
  translations['learn.recommended'] = 'Recommandé pour Vous';
  translations['learn.saved'] = 'Vos Articles Enregistrés';
  translations['learn.noSaved'] = 'Aucun article enregistré pour le moment';
  translations['learn.sortBy'] = 'Trier par';
  translations['learn.sortRecent'] = 'Plus Récents';
  translations['learn.sortPopular'] = 'Plus Populaires';
  translations['learn.sortAZ'] = 'A-Z';
  translations['learn.sortReadTime'] = 'Temps de Lecture';
  translations['learn.filters'] = 'Filtres';
  translations['learn.clearFilters'] = 'Tout Effacer';
  translations['learn.applyFilters'] = 'Appliquer les Filtres';
  translations['learn.difficulty'] = 'Difficulté';
  translations['learn.beginner'] = 'Débutant';
  translations['learn.intermediate'] = 'Intermédiaire';
  translations['learn.advanced'] = 'Avancé';
  translations['learn.readTime'] = 'Temps de Lecture';
  translations['learn.under5'] = 'Moins de 5 min';
  translations['learn.fiveTo10'] = '5-10 min';
  translations['learn.over10'] = '10+ min';
  translations['learn.relatedArticles'] = 'Articles Connexes';
  translations['learn.bookmarked'] = 'Enregistré';
  translations['learn.shareArticle'] = 'Partager l\'Article';
  translations['learn.noResults'] = 'Aucun article trouvé';
  translations['learn.tryDifferent'] = 'Essayez d\'autres termes de recherche ou filtres';
  translations['learn.tryDifferentFilters'] = 'Essayez d\'autres termes de recherche ou filtres';
  translations['learn.min'] = 'min';

  // Article titles and descriptions
  translations['learn.articles.tax.1.title'] = 'Bases de la Déclaration d\'Impôts';
  translations['learn.articles.tax.1.description'] = 'Guide essentiel pour comprendre les exigences en matière de déclaration de revenus, les délais et les déductions auxquelles vous pourriez avoir droit.';
  translations['learn.articles.tax.2.title'] = 'Déductions Fiscales Courantes';
  translations['learn.articles.tax.2.description'] = 'Maximisez votre remboursement en comprenant les déductions et crédits auxquels vous avez droit en tant qu\'immigrant.';
  translations['learn.articles.tax.3.title'] = 'Déclaration d\'Impôts en tant qu\'Indépendant';
  translations['learn.articles.tax.3.description'] = 'Si vous êtes pigiste, chauffeur VTC ou gérant une petite entreprise, ce guide couvre vos obligations fiscales spécifiques.';
  translations['learn.articles.tax.4.title'] = 'Comprendre les Remboursements d\'Impôts';
  translations['learn.articles.tax.4.description'] = 'Découvrez comment fonctionnent les remboursements d\'impôts, comment maximiser le vôtre et comment suivre l\'état de votre remboursement.';
  translations['learn.articles.tax.5.title'] = 'Guide des Impôts d\'État';
  translations['learn.articles.tax.5.description'] = 'Tous les États n\'ont pas d\'impôt sur le revenu. Découvrez quels États vous imposent et comment déclarer vos impôts d\'État.';

  translations['learn.articles.immigration.1.title'] = 'Aperçu des Types de Visa';
  translations['learn.articles.immigration.1.description'] = 'Un guide complet des catégories de visa les plus courantes aux États-Unis pour le travail, la famille et les études.';
  translations['learn.articles.immigration.2.title'] = 'Processus de la Carte Verte';
  translations['learn.articles.immigration.2.description'] = 'Guide étape par étape pour obtenir la résidence permanente par la voie familiale, professionnelle ou autres parcours.';
  translations['learn.articles.immigration.3.title'] = 'Chemin vers la Citoyenneté';
  translations['learn.articles.immigration.3.description'] = 'Comprendre le processus de naturalisation de résident permanent à citoyen américain.';
  translations['learn.articles.immigration.4.title'] = 'Comprendre le DACA';
  translations['learn.articles.immigration.4.description'] = 'Ce qu\'est le DACA, qui est éligible, état actuel et alternatives disponibles pour les Dreamers.';
  translations['learn.articles.immigration.5.title'] = 'Guide d\'Autorisation de Travail';
  translations['learn.articles.immigration.5.description'] = 'Comment obtenir et maintenir l\'autorisation de travail aux États-Unis, y compris les cartes EAD et le parrainage des employeurs.';

  translations['learn.articles.housing.1.title'] = 'Aperçu des Droits des Locataires';
  translations['learn.articles.housing.1.description'] = 'Connaître vos droits en tant que locataire aux États-Unis, des normes d\'habitabilité à la protection contre la discrimination.';
  translations['learn.articles.housing.2.title'] = 'Comprendre les Contrats de Bail';
  translations['learn.articles.housing.2.description'] = 'Ce qu\'il faut rechercher dans votre bail, vos droits et obligations, et les clauses courantes à surveiller.';
  translations['learn.articles.housing.3.title'] = 'Protection contre l\'Expulsion';
  translations['learn.articles.housing.3.description'] = 'Comprendre le processus d\'expulsion, vos droits pendant l\'expulsion et comment combattre les expulsions illégales.';
  translations['learn.articles.housing.4.title'] = 'Guide du Dépôt de Garantie';
  translations['learn.articles.housing.4.description'] = 'Comment fonctionnent les dépôts de garantie, ce que les propriétaires peuvent déduire et comment récupérer votre argent.';
  translations['learn.articles.housing.5.title'] = 'Lois sur le Logement Équitable';
  translations['learn.articles.housing.5.description'] = 'Protection contre la discrimination en matière de logement fondée sur la race, la religion, l\'origine nationale et d\'autres caractéristiques.';

  translations['learn.articles.legal.1.title'] = 'Quand Engager un Avocat';
  translations['learn.articles.legal.1.description'] = 'Comprendre quand la représentation juridique est essentielle et comment trouver des avocats abordables.';
  translations['learn.articles.legal.2.title'] = 'Ressources d\'Aide Juridique Gratuite';
  translations['learn.articles.legal.2.description'] = 'Où trouver une aide juridique gratuite ou à faible coût dans votre communauté.';
  translations['learn.articles.legal.3.title'] = 'Connaissez Vos Droits';
  translations['learn.articles.legal.3.description'] = 'Droits essentiels qui vous protègent lors des interactions avec la police, ICE et dans la vie quotidienne.';
  translations['learn.articles.legal.4.title'] = 'Gérer les Contraventions';
  translations['learn.articles.legal.4.description'] = 'Que faire si vous recevez une contravention, vos options et comment protéger votre dossier de conduite.';
  translations['learn.articles.legal.5.title'] = 'Notions de Base du Droit du Travail';
  translations['learn.articles.legal.5.description'] = 'Vos droits sur le lieu de travail, du salaire minimum aux protections de sécurité et aux lois anti-discrimination.';

  translations['learn.articles.career.1.title'] = 'Guide de Rédaction de CV';
  translations['learn.articles.career.1.description'] = 'Créez un CV professionnel qui vous décroche des entretiens, avec des modèles et des conseils pour les immigrants.';
  translations['learn.articles.career.2.title'] = 'Préparation aux Entretiens';
  translations['learn.articles.career.2.description'] = 'Maîtrisez l\'art de l\'entretien, des questions courantes aux stratégies de suivi.';
  translations['learn.articles.career.3.title'] = 'Stratégies de Réseautage';
  translations['learn.articles.career.3.description'] = 'Construisez des connexions professionnelles qui mènent à des opportunités d\'emploi et à l\'évolution de carrière.';
  translations['learn.articles.career.4.title'] = 'Optimisation du LinkedIn';
  translations['learn.articles.career.4.description'] = 'Construisez un profil LinkedIn puissant qui attire les recruteurs et les opportunités.';
  translations['learn.articles.career.5.title'] = 'Guide de Changement de Carrière';
  translations['learn.articles.career.5.description'] = 'Comment réussir une transition vers un nouveau domaine professionnel, de l\'évaluation à l\'exécution.';

  translations['learn.articles.health.1.title'] = 'Notions de Base de l\'Assurance Maladie';
  translations['learn.articles.health.1.description'] = 'Comprendre le système d\'assurance maladie américain, y compris les forfaits du marketplace et la couverture employeur.';
  translations['learn.articles.health.2.title'] = 'Comprendre Medicaid';
  translations['learn.articles.health.2.description'] = 'Éligibilité, avantages et comment demander la couverture Medicaid et CHIP.';
  translations['learn.articles.health.3.title'] = 'Guide des Soins d\'Urgence';
  translations['learn.articles.health.3.description'] = 'Que faire en cas d\'urgence médicale, vos droits aux urgences et comment gérer les frais médicaux d\'urgence.';
  translations['learn.articles.health.4.title'] = 'Ressources en Santé Mentale';
  translations['learn.articles.health.4.description'] = 'Accéder aux services de santé mentale, à la thérapie et au conseil, y compris des ressources pour les immigrants.';
  translations['learn.articles.health.5.title'] = 'Trouver un Médecin';
  translations['learn.articles.health.5.description'] = 'Comment trouver le bon médecin de famille, comprendre la relation médecin-patient et naviguer dans le système de santé.';

  translations['learn.articles.finance.1.title'] = 'Notions de Base Bancaires';
  translations['learn.articles.finance.1.description'] = 'Comment ouvrir un compte bancaire, choisir la bonne banque et gérer votre argent dans le système bancaire américain.';
  translations['learn.articles.finance.2.title'] = 'Comprendre le Score de Crédit';
  translations['learn.articles.finance.2.description'] = 'Ce qu\'est un score de crédit, comment il affecte votre vie et comment construire et améliorer le vôtre.';
  translations['learn.articles.finance.3.title'] = 'Guide de Budgétisation';
  translations['learn.articles.finance.3.description'] = 'Créez et maintenez un budget personnel qui fonctionne pour vos revenus et vos objectifs.';
  translations['learn.articles.finance.4.title'] = 'Envoyer de l\'Argent à l\'Étranger';
  translations['learn.articles.finance.4.description'] = 'Comparez les services et méthodes de transfert international d\'argent, en minimisant les frais et en maximisant la valeur.';
  translations['learn.articles.finance.5.title'] = 'Gérer les Dettes';
  translations['learn.articles.finance.5.description'] = 'Stratégies pour rembourser les dettes, éviter les prêts prédateurs et construire la liberté financière.';

  translations['learn.articles.education.1.title'] = 'Programmes ESL';
  translations['learn.articles.education.1.description'] = 'Trouvez des cours d\'anglais, des programmes communautaires gratuits aux plateformes d\'apprentissage en ligne.';
  translations['learn.articles.education.2.title'] = 'Préparation au GED';
  translations['learn.articles.education.2.description'] = 'Obtenez votre diplôme d\'équivalence du secondaire via le test GED, avec des ressources d\'étude et des conseils.';
  translations['learn.articles.education.3.title'] = 'Bourses d\'Études Universitaires';
  translations['learn.articles.education.3.description'] = 'Trouvez et postulez aux bourses, subventions et aides financières pour financer votre éducation.';
  translations['learn.articles.education.4.title'] = 'Plateformes d\'Apprentissage en Ligne';
  translations['learn.articles.education.4.description'] = 'Les meilleures plateformes pour acquérir de nouvelles compétences, obtenir des certificats et faire progresser votre carrière en ligne.';
  translations['learn.articles.education.5.title'] = 'Guide des Écoles Professionnelles';
  translations['learn.articles.education.5.description'] = 'Options de formation professionnelle et d\'écoles de métiers pour des carrières à forte demande avec des périodes de formation plus courtes.';

  translations['learn.articles.safety.1.title'] = 'Prévention des Arnaques';
  translations['learn.articles.safety.1.description'] = 'Reconnaissez et évitez les arnaques courantes ciblant les immigrants, de la fraude téléphonique aux faux services.';
  translations['learn.articles.safety.2.title'] = 'Ressources sur les Violences Conjugales';
  translations['learn.articles.safety.2.description'] = 'Planification de sécurité, ressources et protections légales pour les victimes de violences conjugales.';
  translations['learn.articles.safety.3.title'] = 'Connaissez Vos Droits : les Intéractions avec ICE';
  translations['learn.articles.safety.3.description'] = 'Que faire si ICE vient à votre domicile, lieu de travail ou si vous êtes arrêté en public.';
  translations['learn.articles.safety.4.title'] = 'Planification d\'Urgence';
  translations['learn.articles.safety.4.description'] = 'Créez un plan d\'urgence familial qui vous prépare aux catastrophes naturelles, à la séparation ou aux situations de crise.';
  translations['learn.articles.safety.5.title'] = 'Guide de Sécurité en Ligne';
  translations['learn.articles.safety.5.description'] = 'Protégez-vous contre les arnaques en ligne, le vol d\'identité et les menaces à la vie privée numérique.';

  translations['learn.articles.community.1.title'] = 'Adaptation Culturelle';
  translations['learn.articles.community.1.description'] = 'Naviguer le choc culturel, s\'adapter aux coutumes américaines et maintenir votre identité culturelle.';
  translations['learn.articles.community.2.title'] = 'Trouver Votre Communauté';
  translations['learn.articles.community.2.description'] = 'Comment construire un réseau social, trouver des groupes de soutien et créer un sentiment d\'appartenance dans votre nouveau foyer.';
  translations['learn.articles.community.3.title'] = 'Échange de Langues';
  translations['learn.articles.community.3.description'] = 'Trouvez des partenaires et des programmes d\'échange de langues pour améliorer votre anglais tout en partageant votre langue.';
  translations['learn.articles.community.4.title'] = 'Ressources Fondées sur la Foi';
  translations['learn.articles.community.4.description'] = 'Trouvez des communautés religieuses et des organisations fondées sur la foi qui soutiennent les immigrants.';
  translations['learn.articles.community.5.title'] = 'Opportunités de Bénévolat';
  translations['learn.articles.community.5.description'] = 'Donnez à votre communauté tout en développant des compétences, des contacts et de l\'expérience.';

  translations['learn.articles.work.1.title'] = 'Droits des Travailleurs de la Gig Economy';
  translations['learn.articles.work.1.description'] = 'Comprendre vos droits en tant que travailleur de la gig economy, y compris les VTC, la livraison et le travail indépendant.';
  translations['learn.articles.work.2.title'] = 'Lois du Travail aux États-Unis';
  translations['learn.articles.work.2.description'] = 'Comprendre le salaire minimum, les heures supplémentaires, les pauses et autres protections sur le lieu de travail selon le droit fédéral et étatique.';
  translations['learn.articles.work.3.title'] = 'Prévention du Vol de Salaires';
  translations['learn.articles.work.3.description'] = 'Reconnaître et récupérer les salaires volés, et comment signaler les employeurs qui ne paient pas équitablement.';
  translations['learn.articles.work.4.title'] = 'Comprendre les Syndicats';
  translations['learn.articles.work.4.description'] = 'Ce que sont les syndicats, comment ils protègent les travailleurs et comment en organiser ou en rejoindre un sur votre lieu de travail.';
  translations['learn.articles.work.5.title'] = 'Guide d\'Autorisation de Travail';
  translations['learn.articles.work.5.description'] = 'Guide complet pour maintenir l\'autorisation de travail, changer d\'employeur et les exigences de conformité.';
}

// ============================================================
// MERGE LOGIC
// ============================================================

function setNestedValue(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    // Check if next part is a number (array index)
    const nextPart = parts[i + 1];
    const isNextArray = /^\d+$/.test(nextPart);
    
    if (!(part in current)) {
      current[part] = isNextArray ? [] : {};
    }
    current = current[part];
  }
  
  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
}

// Apply all translations
let count = 0;
for (const [key, value] of Object.entries(translations)) {
  setNestedValue(target, key, value);
  count++;
}

// Write the updated file
const output = JSON.stringify(target, null, 2);
fs.writeFileSync(targetPath, output, 'utf8');

console.log(`✅ Merged ${count} translated strings into ${lang}.json`);
console.log(`   File: ${targetPath}`);
console.log(`   Size: ${(Buffer.byteLength(output) / 1024).toFixed(1)} KB`);
