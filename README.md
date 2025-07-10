# Video Upload Portal

## Visão Geral

Este projeto é uma interface de front-end moderna e eficiente, desenvolvida para simplificar o processo de upload de vídeos. O objetivo principal é oferecer uma experiência de usuário fluida e intuitiva, permitindo o envio de múltiplos arquivos de forma simultânea com feedback visual claro sobre o progresso de cada um. A aplicação foi construída com foco em performance, escalabilidade e manutenibilidade, utilizando um stack de tecnologias moderno baseado em React e TypeScript.

## Funcionalidades Principais

- **Upload Múltiplo de Arquivos:** Permite que os usuários selecionem e enviem vários vídeos de uma só vez, otimizando o tempo e melhorando a eficiência do fluxo de trabalho.
- **Área de Arrastar e Soltar (Drag & Drop):** Oferece uma alternativa visual e interativa ao diálogo de seleção de arquivos tradicional. A área de drop se torna um ponto focal da interface, guiando o usuário de forma intuitiva.
- **Fila de Upload e Gerenciamento:** Antes de iniciar o envio, os arquivos selecionados são exibidos em uma lista clara. Isso dá ao usuário a oportunidade de revisar sua seleção, ver detalhes como nome e tamanho do arquivo, e remover itens indesejados da fila.
- **Acompanhamento de Progresso em Tempo Real:** Cada arquivo na fila possui seu próprio indicador de status (`Pendente`, `Enviando`, `Concluído`, `Falhou`), fornecendo feedback transparente e imediato sobre o que está acontecendo.
- **Design Responsivo e Minimalista:** A interface foi projetada para ser limpa e funcional, adaptando-se a diferentes resoluções de tela para garantir uma experiência consistente em desktops, tablets e dispositivos móveis.

## Tecnologias

A seleção de tecnologias foi pensada para criar uma base de código robusta, moderna e de fácil manutenção.

- **React:** Utilizado como a biblioteca principal para a construção da interface de usuário, permitindo a criação de componentes reutilizáveis e a gestão de estados complexos de forma declarativa.
- **TypeScript:** Adiciona uma camada de tipagem estática sobre o JavaScript, o que aumenta a segurança do código, melhora a produtividade do desenvolvedor e facilita a refatoração e a manutenção a longo prazo.
- **Tailwind CSS:** Um framework CSS "utility-first" que permite a construção de designs customizados diretamente no markup, acelerando o processo de estilização sem a necessidade de sair do HTML.
- **Vite:** Atua como a ferramenta de build e servidor de desenvolvimento. Oferece um tempo de inicialização extremamente rápido e Hot Module Replacement (HMR) instantâneo, melhorando significativamente a experiência de desenvolvimento.
