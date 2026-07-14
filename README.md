# Portfólio — Eliana Mazieiro

Site de página única (portfólio) para **Eliana Mazieiro — Terapia Integrativa Quântica**.

O hero é uma adaptação da técnica do template **Loopstack** (getlayers): fundo
preto, **vídeo de flor em loop** ao fundo, nome gigante ("Eliana") fixado embaixo,
headline que se revela palavra por palavra, botão-pílula com dot pulsante e um
**cursor customizado** (anel + plaquinha de vidro "FALE COMIGO"). Abaixo do hero,
o site rola normalmente pelas seções Sobre, Terapias, Como funciona e Contato.

> A marca, os textos e o wordmark foram trocados para a Eliana — não é o
> template Loopstack publicado como está.

## Como visualizar

- **Mais simples:** dê dois cliques em `index.html`.
- **Com servidor local:**
  ```bash
  cd portfolio-eliana
  python -m http.server 8777
  ```
  Depois abra <http://localhost:8777>.

## ⚠️ Importante: o vídeo da flor é um PLACEHOLDER

Em `index.html`, o `<video>` do hero aponta temporariamente para um asset
hospedado no getlayers, **só para você ver o efeito funcionando**:

```
https://api.getlayers.ai/storage/v1/object/public/public/assets/loopstack-f8c64439bf/flower.mp4
```

**Antes de publicar, troque essa URL** por um vídeo próprio ou de banco licenciado
(ex.: Pexels, Coverr) e coloque o arquivo em `assets/`. Motivos:
- é um asset do getlayers — pode sair do ar a qualquer momento;
- para uso comercial, o ideal é um vídeo que seja realmente seu/licenciado.

Se o vídeo não carregar, o hero mostra um brilho suave de reserva (não fica vazio).

## Estrutura

| Arquivo       | O que é                                              |
|---------------|------------------------------------------------------|
| `index.html`  | Conteúdo e seções                                    |
| `styles.css`  | Estilos, paleta, animações de revelação e cursor     |
| `script.js`   | Split de palavras/letras + física do cursor          |
| `assets/`     | Coloque aqui a foto da Eliana e o vídeo da flor       |

## O que ainda precisa dos dados reais

1. **Vídeo da flor** — ver aviso acima.
2. **Foto da Eliana** — substitua o placeholder em `.sobre-photo` por uma `<img>`.
3. **WhatsApp** — troque `5500000000000` (aparece no CTA e no rodapé).
4. **E-mail** — troque `contato@exemplo.com`.
5. **Instagram** — ajuste o link do ícone no rodapé.
6. **Terapias e bio** — os textos são um ponto de partida editável.

## Fundo Aurora (seção Sobre)

A seção **Sobre** tem um fundo animado "Aurora" (efeito de aurora boreal),
portado do componente Aurora do React Bits para **WebGL2 nativo** — mesmos
shaders, **sem dependências externas** (não usa a lib `ogl` nem CDN).

Fica em `script.js` (função `initAurora`). Para ajustar, edite lá:
- `colorStops` — as três cores (hoje `#95595D`, `#5D3757`, `#272040`).
- `speed` (0.5), `amplitude` (1.0), `blend` (0.5).

Pausa sozinho quando a seção sai da tela. Anima **independente** de
`prefers-reduced-motion` (a pedido — o efeito é lento e ambiente). Se o
navegador não tiver WebGL2, a seção fica só com o fundo escuro.

## Ajustes rápidos

Em `styles.css`, no `:root`:
- `--accent` (violeta quântico) e `--status` (verde do dot "disponível").
- `.hero-logo-text { font-size }` — tamanho do wordmark "Eliana".

O efeito respeita `prefers-reduced-motion` e o cursor customizado só aparece em
dispositivos com mouse (no toque, usa o cursor normal).

## Créditos

Técnica do hero inspirada no template **Loopstack** de getlayers.ai (prompt free),
adaptada para a identidade da Eliana Mazieiro.
