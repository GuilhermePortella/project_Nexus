---
title: "Como migrar um legado para Arquitetura Hexagonal sem parar o mundo"
summary: "Um guia técnico e estratégico sobre como modernizar sistemas legados de forma incremental e segura, desacoplando o domínio das tecnologias externas e evoluindo sem interrupções operacionais."
author: "Guilherme Portella"
publishedDate: "2025-11-01"
keywords:
  - Arquitetura Hexagonal
  - Sistemas Legados
  - Modernização Incremental
  - Clean Architecture
  - Strangler Pattern
  - Refatoração
  - Engenharia de Software
seo:
  title: "Migrando sistemas legados para Arquitetura Hexagonal sem parar o mundo"
  description: "Como aplicar o padrão Ports and Adapters em sistemas legados, migrando gradualmente sem reescrita total e preservando a operação."
---

## Introdução

Migrar um sistema legado é, antes de tudo, um exercício de **cirurgia arquitetural** — o desafio é intervir sem interromper o paciente.  
A arquitetura hexagonal (Ports and Adapters) surge como uma ferramenta para tornar essa transição **segura, incremental e reversível**.  
Ao invés de um “big bang”, a estratégia é **desacoplar, isolar e reconstruir em torno de um núcleo estável**, permitindo que novas funcionalidades coexistam com o código antigo até que a migração esteja completa.

Este artigo aprofunda o **“como”** dessa transição: quais princípios guiam o processo, quais práticas tornam-no viável e quais armadilhas precisam ser evitadas.

---

## 1. O dilema da modernização contínua

Reescrever tudo do zero costuma ser tentador — o desenvolvedor imagina uma base limpa, moderna e sem dívidas. Mas, na prática, isso **raramente é sustentável**.  
Enquanto a reescrita ocorre, o negócio continua evoluindo. Novas regras são criadas, clientes seguem operando, e o backlog não para.  
O resultado? Dois sistemas competindo: o legado que ainda funciona e o novo que ainda não entrega valor.

A arquitetura hexagonal oferece uma **saída realista**: preservar o funcionamento atual enquanto se refatora o interior da aplicação de forma controlada.  
Não é sobre apagar o passado — é sobre **refatorar o presente com visão de futuro**.

---

## 2. O ponto de partida: compreender o que é essencial

Antes de aplicar o padrão, é preciso **entender o que realmente constitui o “domínio”** do sistema.  
Um erro comum é começar movendo repositórios, controladores e DTOs, quando o que deve ser isolado primeiro são **as regras de negócio puras**, aquelas que respondem à pergunta:  
> “Se eu tirasse o banco de dados e o framework web, ainda teria lógica de negócio útil aqui?”

Essas regras são o **coração** do sistema. Tudo ao redor — persistência, transporte, APIs, mensageria — são **periféricos substituíveis**.  
A meta inicial é protegê-las em um núcleo isolado, livre de dependências.

---

## 3. O princípio do desacoplamento incremental

A migração para arquitetura hexagonal não é um evento, mas um **processo iterativo**.  
O princípio é simples:

> “Desacople casos de uso do transporte e da persistência.  
> Crie portas e adaptadores finos.  
> Migre periféricos em torno de um core estável.”

### 3.1. Separar casos de uso do transporte

Cada endpoint, fila ou comando CLI deve invocar uma **porta de entrada** (input port) — uma interface que representa um caso de uso.  
A implementação concreta desse caso de uso é um **interactor** (ou application service).  
Assim, controladores, filas e jobs não conhecem detalhes internos: eles apenas chamam a porta e recebem o resultado.

```java
// Porta (Input Port)
public interface ProcessarPagamentoUseCase {
    void executar(PagamentoRequest request);
}

// Implementação (Interactor)
public class ProcessarPagamentoService implements ProcessarPagamentoUseCase {
    private final PagamentoRepository repository;
    private final GatewayDePagamento gateway;

    @Override
    public void executar(PagamentoRequest request) {
        var pagamento = Pagamento.criar(request);
        repository.salvar(pagamento);
        gateway.notificar(pagamento);
    }
}
