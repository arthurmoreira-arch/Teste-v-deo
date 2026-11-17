#!/usr/bin/env python3
"""Avatar pixel art do canal (64x64), desenhado pixel a pixel a partir da foto do criador:
cabelo preto com volume e risca no meio, óculos sem aro, bigode + cavanhaque, pele morena, brincos, corrente de prata.
Cada tema de vídeo troca a roupa (e às vezes o chapéu). Uso:
  python3 avatar/avatar.py            -> gera avatar/out/*.png (16x) + folha com todas as roupas
"""
import pathlib
from PIL import Image

N = 64
ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "out"

def hx(c):
    c = c.lstrip("#"); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)) + (255,)

P = {k: hx(v) for k, v in dict(
    skin="#c58a62", skinSh="#a46c4a", skinHi="#dca07a", skinDk="#7a4a32",
    hair="#17121a", hairHi="#3a2f3c", hairMd="#261e28",
    beard="#2b1d1c", stub="#7d543c", lip="#8e4a42", lipHi="#ad6355",
    eyeW="#ece4dc", eye="#1e1416", brow="#1c1416",
    glass="#d8e0e8", glassSh="#9aa6b4", lens="#e6eef6", gold="#f2f2f6",
    ink="#0c0a10", white="#ffffff",
).items()}


class Canvas:
    def __init__(self):
        self.img = Image.new("RGBA", (N, N), (0, 0, 0, 0))
        self.px = self.img.load()

    def set(self, x, y, c):
        if 0 <= x < N and 0 <= y < N and c is not None:
            if len(c) == 4 and c[3] < 255:  # mistura (lentes)
                b = self.px[x, y]
                a = c[3] / 255
                c = tuple(int(b[i] * (1 - a) + c[i] * a) for i in range(3)) + (255,)
            self.px[x, y] = c

    def rect(self, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.set(x, y, c)

    def hline(self, x0, x1, y, c):
        self.rect(x0, y, x1, y, c)

    def rows(self, spans, c):
        """spans = {y: (x0, x1)}"""
        for y, (a, b) in spans.items():
            self.hline(a, b, y, c)

    def outline(self, c=P["ink"]):
        src = self.img.copy().load()
        for y in range(N):
            for x in range(N):
                if src[x, y][3] == 0 and any(0 <= x + dx < N and 0 <= y + dy < N and src[x + dx, y + dy][3] > 0 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    self.px[x, y] = c


# ------------------------------------------------------------ rosto
FACE = {15: 7, 16: 9, 17: 10, **{y: 11 for y in range(18, 33)}, 33: 10, 34: 10, 35: 9, 36: 8, 37: 7, 38: 6, 39: 5, 40: 3}
CX = 32  # centro (o rosto ocupa x = CX-w .. CX+w-1)

def face(cv, expr):
    # pescoço
    cv.rect(27, 38, 36, 47, P["skinSh"])
    cv.rect(27, 38, 29, 47, P["skin"])
    # orelhas
    for x0 in (19, 43):
        cv.rect(x0, 24, x0 + 1, 30, P["skinSh"])
        cv.set(x0 + (0 if x0 == 19 else 1), 27, P["skinDk"])
    # pele
    for y, w in FACE.items():
        cv.hline(CX - w, CX + w - 1, y, P["skin"])
        cv.set(CX + w - 1, y, P["skinSh"]); cv.set(CX + w - 2, y, P["skinSh"])  # lado da sombra
    for y in range(24, 33):
        cv.set(CX - 10, y, P["skinHi"])  # luz na bochecha esquerda
    cv.rect(23, 29, 25, 30, P["skinHi"])
    # sobrancelhas
    for x0 in (25, 35):
        cv.hline(x0, x0 + 4, 21, P["brow"]); cv.set(x0 + (0 if x0 == 25 else 4), 22, P["brow"])
    # olhos
    for x0 in (26, 36):
        if expr == "blink":
            cv.hline(x0 - 1, x0 + 3, 25, P["eye"])
        else:
            cv.hline(x0, x0 + 2, 24, P["eyeW"]); cv.hline(x0, x0 + 2, 25, P["eyeW"])
            cv.rect(x0 + 1, 24, x0 + 2, 25, P["eye"])
            cv.set(x0 + 1, 24, P["white"])
            cv.hline(x0 - 1, x0 + 3, 23, P["eye"])  # pálpebra superior
    # nariz
    for y in range(27, 31):
        cv.set(33, y, P["skinSh"])
    cv.hline(30, 33, 31, P["skinSh"]); cv.set(30, 30, P["skinDk"]); cv.set(34, 30, P["skinDk"])
    cv.set(31, 28, P["skinHi"])
    # barba rala no maxilar (pontilhado)
    for y in range(31, 40):
        w = FACE[y]
        for x in range(CX - w, CX + w):
            edge = x <= CX - w + 2 or x >= CX + w - 3 or y >= 37
            if edge and (x + y) % 2 == 0:
                cv.set(x, y, P["stub"])
    # bigode
    cv.hline(28, 36, 32, P["beard"]); cv.set(27, 33, P["beard"]); cv.set(37, 33, P["beard"])
    # boca
    if expr == "talk":
        cv.hline(29, 35, 34, P["lip"]); cv.rect(30, 35, 34, 36, P["eye"]); cv.hline(30, 34, 37, P["lip"]); cv.set(31, 35, P["eyeW"]); cv.set(32, 35, P["eyeW"])
    elif expr == "smirk":
        cv.hline(29, 34, 34, P["lip"]); cv.set(35, 33, P["lip"]); cv.hline(30, 33, 35, P["lipHi"])
    else:
        cv.hline(29, 35, 34, P["lip"]); cv.hline(30, 34, 35, P["lipHi"])
    # cavanhaque
    for y, (a, b) in {37: (30, 34), 38: (28, 36), 39: (28, 36), 40: (29, 35), 41: (30, 34)}.items():
        if not (expr == "talk" and y == 37):
            cv.hline(a, b, y, P["beard"])
    cv.set(32, 36, P["beard"]); cv.set(31, 36, P["beard"]); cv.set(33, 36, P["beard"])
    # brincos
    cv.set(19, 31, P["gold"]); cv.set(44, 31, P["gold"])


def glasses(cv):
    for x0 in (24, 34):  # lentes sem aro
        for y in range(22, 28):
            for x in range(x0, x0 + 7):
                cv.set(x, y, P["lens"][:3] + (60,))
        cv.hline(x0, x0 + 6, 22, P["glass"]); cv.hline(x0 + 1, x0 + 5, 28, P["glassSh"])
        cv.set(x0, 27, P["glassSh"]); cv.set(x0 + 6, 27, P["glassSh"])
        cv.set(x0 + 1, 23, P["white"]); cv.set(x0 + 2, 23, P["white"])  # reflexo
    cv.hline(31, 33, 23, P["gold"])  # ponte
    cv.hline(21, 23, 23, P["glass"]); cv.hline(41, 43, 23, P["glass"])  # hastes


def hair(cv, cover_top=False):
    """Cabelo da foto: volume arredondado em cima, risca no meio e franja em "cortina" caindo na testa; laterais curtas."""
    H, M, L = P["hair"], P["hairMd"], P["hairHi"]
    if not cover_top:
        cv.rows({5: (27, 36), 6: (24, 39), 7: (22, 41), 8: (20, 43), 9: (19, 44), 10: (19, 44), 11: (18, 45), 12: (18, 45), 13: (18, 45), 14: (18, 45)}, H)
        # risca no meio abrindo a testa; franja em "cortina" caindo pelos lados
        cv.rows({15: (18, 29), 16: (18, 27), 17: (18, 25), 18: (18, 23), 19: (18, 21)}, H)
        cv.rows({15: (34, 45), 16: (36, 45), 17: (38, 45), 18: (40, 45), 19: (42, 45)}, H)
        cv.rows({y: (31, 32) for y in range(7, 15)}, M)
        # mechas com brilho, curvando para os lados
        cv.rows({8: (27, 29), 9: (25, 28), 10: (23, 26), 11: (22, 24), 13: (25, 29), 14: (23, 27), 15: (21, 24)}, L)
        cv.rows({8: (34, 36), 9: (35, 38), 10: (37, 40), 11: (39, 41), 13: (34, 38), 14: (36, 40), 15: (39, 42)}, L)
    # laterais curtas (orelhas aparecem)
    cv.rect(18, 18, 19, 23, H); cv.rect(44, 18, 45, 23, H)


# ------------------------------------------------------------ roupas
def torso(cv, c, sh, hi=None, neck=None):
    rows = {46: (24, 39), 47: (18, 45), 48: (14, 49), 49: (11, 52), 50: (9, 54), 51: (8, 55)}
    rows.update({y: (6 + max(0, 52 - y) // 6, 57 - max(0, 52 - y) // 6) for y in range(52, 64)})
    cv.rows(rows, c)
    for y in range(49, 64):
        a, b = rows[y]
        cv.hline(b - 6, b, y, sh)  # lado da sombra
        if hi: cv.set(a + 1, y, hi)
    if neck:
        cv.rows({46: (27, 36), 47: (28, 35)}, neck)


def chain(cv):
    S = hx("#c9ced8")
    for i, (x, y) in enumerate([(26, 47), (27, 48), (28, 50), (29, 51), (30, 52), (31, 53), (32, 54), (33, 53), (34, 52), (35, 51), (36, 50), (37, 48), (38, 47)]):
        cv.set(x, y, S if i % 2 == 0 else hx("#8e94a2"))
    cv.rect(31, 55, 32, 57, hx("#e6eaf2"))


def o_casual(cv):  # camiseta preta + corrente (como na foto)
    torso(cv, hx("#16151c"), hx("#0d0c12"), hx("#2a2934"))
    cv.rows({45: (27, 36)}, P["skinSh"])
    cv.hline(26, 37, 46, hx("#24232e"))
    chain(cv)


def o_historia(cv):  # legionário romano: armadura de bronze, capa vermelha, capacete com crista
    torso(cv, hx("#b0262c"), hx("#7a161c"))
    for y in range(50, 64):
        cv.hline(18, 45, y, hx("#c8963a"))
        cv.hline(40, 45, y, hx("#94682a"))
    for y in (52, 55, 58, 61):
        cv.hline(18, 45, y, hx("#6a4a1e"))
    cv.rect(26, 46, 37, 49, hx("#c8963a"))
    cv.hline(25, 38, 50, hx("#e8c070"))


def hat_romano(cv):
    B, D, Hh = hx("#c8963a"), hx("#94682a"), hx("#ecc77a")
    cv.rows({6: (22, 41), 7: (20, 43), 8: (19, 44), 9: (18, 45), 10: (18, 45), 11: (17, 46), 12: (17, 46), 13: (17, 46), 14: (17, 46), 15: (17, 46), 16: (17, 46), 17: (17, 46)}, B)
    cv.rows({15: (17, 46), 16: (17, 46)}, D)
    cv.rect(17, 17, 21, 31, B); cv.rect(42, 17, 46, 31, B)  # protetores de bochecha
    cv.rect(17, 17, 18, 31, D); cv.rect(45, 17, 46, 31, D)
    cv.rows({8: (24, 30), 9: (22, 26)}, Hh)
    R = hx("#d22b34")
    cv.rows({0: (26, 37), 1: (24, 39), 2: (23, 40), 3: (24, 39), 4: (28, 35), 5: (29, 34)}, R)  # crista
    cv.rows({1: (26, 30), 2: (25, 28)}, hx("#ff5a62"))


def o_cinema(cv):  # diretor: jaqueta jeans + cachecol vermelho
    torso(cv, hx("#3e5f94"), hx("#2a4270"), hx("#5a7cb4"))
    for x in (20, 43):
        cv.rect(x, 52, x + 1, 63, hx("#2a4270"))
    cv.rows({46: (24, 39), 47: (22, 41), 48: (23, 40), 49: (27, 36)}, hx("#d22b34"))
    cv.rect(33, 49, 36, 60, hx("#d22b34")); cv.rect(35, 49, 36, 60, hx("#9a1a22"))
    cv.hline(33, 36, 61, hx("#ffd34a"))


def hat_boina(cv):
    B, H = hx("#1c1c24"), hx("#363642")
    cv.rows({6: (24, 40), 7: (20, 44), 8: (18, 46), 9: (17, 47), 10: (17, 47), 11: (18, 46), 12: (19, 45)}, B)
    cv.rows({7: (24, 30), 8: (22, 27)}, H)
    cv.set(33, 5, B); cv.set(33, 4, B)


def o_terror(cv):  # moletom com capuz escuro + lanterna
    torso(cv, hx("#22202e"), hx("#141320"), hx("#34324a"))
    cv.set(29, 50, hx("#cfd0dc")); cv.rect(29, 51, 29, 56, hx("#cfd0dc"))
    cv.set(34, 50, hx("#cfd0dc")); cv.rect(34, 51, 34, 55, hx("#cfd0dc"))
    cv.rect(22, 58, 41, 63, hx("#1a1926"))


def hat_capuz(cv):
    C, D = hx("#22202e"), hx("#141320")
    cv.rows({5: (24, 39), 6: (20, 43), 7: (18, 45), 8: (17, 46), 9: (16, 47), 10: (15, 48)}, C)
    for y in range(11, 46):
        cv.hline(14, 19 if y < 40 else 23, y, C)
        cv.hline(44 if y < 40 else 40, 49, y, D)
    cv.hline(20, 43, 11, C)


def o_detetive(cv):  # sobretudo bege, gravata
    torso(cv, hx("#b8955e"), hx("#8a6a3a"), hx("#d2b07a"))
    cv.rows({46: (27, 36), 47: (28, 35)}, hx("#f0ece4"))
    cv.rect(29, 48, 34, 63, hx("#f0ece4"))
    cv.rect(31, 47, 32, 60, hx("#7a1a22"))
    for y in range(48, 64):  # lapelas
        d = min(6, (y - 48) // 2)
        cv.hline(26 - d, 28, y, hx("#9e7c48")); cv.hline(35, 37 + d, y, hx("#9e7c48"))


def hat_fedora(cv):
    F, D, Bd = hx("#4a3a2c"), hx("#2e241a"), hx("#1a1410")
    cv.rows({4: (24, 39), 5: (22, 41), 6: (21, 42), 7: (21, 42), 8: (21, 42), 9: (21, 42), 10: (21, 42), 11: (12, 51), 12: (14, 49)}, F)
    cv.hline(21, 42, 10, Bd)
    cv.rows({5: (30, 33), 6: (31, 32)}, D)
    cv.rows({12: (14, 49)}, D)


def o_espaco(cv):  # astronauta
    torso(cv, hx("#e8ecf2"), hx("#b4bcc8"), hx("#ffffff"))
    cv.rows({45: (22, 41), 46: (20, 43), 47: (20, 43)}, hx("#9aa4b4"))  # anel do capacete
    cv.rect(16, 53, 22, 58, hx("#2a6fd1")); cv.rect(17, 54, 21, 57, hx("#e8ecf2")); cv.set(19, 55, hx("#d22b34"))
    cv.rect(38, 54, 46, 57, hx("#ff8a2a"))
    cv.rect(28, 52, 35, 60, hx("#c8ccd6")); cv.set(30, 54, hx("#3ddc84")); cv.set(33, 54, hx("#d22b34")); cv.hline(29, 34, 57, hx("#5a6070"))


def hat_capacete_espacial(cv):
    for y in range(N):
        for x in range(N):
            d = ((x - 32) ** 2 + ((y - 26) * 1.05) ** 2) ** 0.5
            if 21.5 <= d < 23:
                cv.set(x, y, hx("#f0f4fa"))
            elif 20.5 <= d < 21.5:
                cv.set(x, y, hx("#9aa4b4"))
            elif d < 20.5:
                cv.set(x, y, (180, 220, 255, 40))
    cv.rows({9: (15, 19), 10: (14, 17), 11: (13, 16)}, hx("#ffffff"))


def o_medieval(cv):  # cota de malha + tabardo
    torso(cv, hx("#8e96a6"), hx("#5e6676"))
    for y in range(47, 64):
        for x in range(6, 58):
            if (x + y) % 2 == 0 and cv.px[x, y][3] > 0:
                cv.set(x, y, hx("#6e7686"))
    cv.rect(24, 50, 39, 63, hx("#2a4ea8")); cv.rect(24, 50, 25, 63, hx("#ffd34a")); cv.rect(38, 50, 39, 63, hx("#ffd34a"))
    cv.rect(30, 53, 33, 61, hx("#ffd34a")); cv.rect(28, 55, 35, 57, hx("#ffd34a"))


def o_ciencia(cv):  # jaleco
    torso(cv, hx("#f0f2f6"), hx("#c4c8d2"), hx("#ffffff"))
    cv.rect(28, 46, 35, 63, hx("#4a7cc8"))
    for y in range(47, 64):
        d = min(5, (y - 47) // 2)
        cv.hline(26 - d, 28, y, hx("#dcdfe6")); cv.hline(35, 37 + d, y, hx("#dcdfe6"))
    cv.rect(40, 52, 44, 55, hx("#c4c8d2")); cv.set(41, 51, hx("#d22b34")); cv.set(43, 51, hx("#2a6fd1"))


def o_mentalista(cv):  # terno de três peças (The Mentalist)
    torso(cv, hx("#3a4258"), hx("#262c3c"), hx("#4e5874"))
    cv.rows({46: (27, 36), 47: (28, 35)}, hx("#e8eef8"))
    cv.rect(28, 48, 35, 63, hx("#5a647e"))
    cv.rect(30, 48, 33, 52, hx("#e8eef8"))
    for y in (54, 57, 60):
        cv.set(31, y, hx("#c8ccd6"))
    for y in range(48, 64):
        d = min(6, (y - 48) // 2)
        cv.hline(25 - d, 27, y, hx("#2e3548")); cv.hline(36, 38 + d, y, hx("#2e3548"))


def o_pirata(cv):
    torso(cv, hx("#f0e6d2"), hx("#c8b898"))
    cv.rect(22, 50, 41, 63, hx("#7a1a22")); cv.rect(22, 50, 23, 63, hx("#4a0e14")); cv.rect(40, 50, 41, 63, hx("#4a0e14"))
    cv.rows({46: (27, 36), 47: (28, 35), 48: (29, 34), 49: (30, 33)}, P["skinSh"])
    cv.hline(6, 57, 59, hx("#3a2a1a")); cv.rect(30, 58, 33, 60, hx("#e8c070"))


def hat_tricornio(cv):
    T, D = hx("#1c1814"), hx("#e8c070")
    cv.rows({3: (27, 36), 4: (24, 39), 5: (22, 41), 6: (21, 42), 7: (21, 42), 8: (21, 42), 9: (21, 42), 10: (12, 51), 11: (13, 50), 12: (16, 47)}, T)
    cv.rows({9: (12, 51)}, T)
    cv.hline(13, 50, 10, D)
    cv.rect(30, 5, 33, 8, hx("#f0f0f0")); cv.set(31, 6, T); cv.set(32, 6, T)


def o_brasil(cv):  # camisa da seleção
    torso(cv, hx("#f6d32a"), hx("#d8a818"), hx("#fff07a"))
    cv.rows({45: (26, 37), 46: (25, 38), 47: (26, 37)}, hx("#1f9a4a"))
    cv.rows({46: (28, 35), 47: (29, 34)}, P["skinSh"])
    for y in range(48, 64):
        cv.set(9 + max(0, 52 - y) // 6, y, hx("#1f9a4a")); cv.set(54 - max(0, 52 - y) // 6, y, hx("#1f9a4a"))
    cv.rect(16, 52, 20, 57, hx("#2a5ac8")); cv.set(18, 54, hx("#ffffff"))
    cv.rect(39, 51, 43, 57, hx("#1f9a4a")); cv.rect(40, 52, 42, 56, hx("#f6d32a")); cv.set(41, 54, hx("#2a5ac8"))
    chain(cv)


def o_imperio(cv):  # casaca do Império (séc. XIX): azul, gola alta, dragonas e botões dourados
    torso(cv, hx("#1e3a7a"), hx("#122650"), hx("#2e5aa8"))
    cv.rows({45: (26, 37), 46: (25, 38), 47: (26, 37)}, hx("#f0ece4"))  # gola branca
    cv.rows({46: (29, 34), 47: (30, 33)}, P["skinSh"])
    cv.rect(30, 48, 33, 63, hx("#f0ece4"))
    for y in (51, 54, 57, 60):
        cv.set(28, y, hx("#ffd34a")); cv.set(35, y, hx("#ffd34a"))
    for x0 in (8, 46):  # dragonas
        cv.rect(x0, 49, x0 + 9, 51, hx("#ffd34a"))
        for x in range(x0, x0 + 10, 2):
            cv.rect(x, 52, x, 54, hx("#e8b020"))
    cv.rect(37, 49, 40, 63, hx("#c8202a"))  # faixa


OUTFITS = {
    "casual": (o_casual, None, "#1b1b2b"),
    "brasil": (o_brasil, None, "#0e3a24"),
    "imperio": (o_imperio, None, "#2a1a10"),
    "historia": (o_historia, hat_romano, "#5a2a1a"),
    "cinema": (o_cinema, hat_boina, "#2a1a3a"),
    "terror": (o_terror, hat_capuz, "#0c0610"),
    "detetive": (o_detetive, hat_fedora, "#1a2430"),
    "espaco": (o_espaco, hat_capacete_espacial, "#06081a"),
    "medieval": (o_medieval, None, "#2a2a1a"),
    "ciencia": (o_ciencia, None, "#0e2a2a"),
    "mentalista": (o_mentalista, None, "#2a1a1a"),
    "pirata": (o_pirata, hat_tricornio, "#0a2a3a"),
}
COVER = {"historia", "cinema", "terror", "detetive", "pirata"}


def build(outfit="casual", expr="neutral"):
    body, hat, _ = OUTFITS[outfit]
    cv = Canvas()
    body(cv)
    face(cv, expr)
    hair(cv, cover_top=outfit in COVER)
    if outfit in COVER and outfit != "terror":
        hair(cv, cover_top=True)
    glasses(cv)
    if hat:
        hat(cv)
    if outfit != "espaco":
        cv.outline()
    return cv.img


def scaled(img, s=16, bg=None):
    big = img.resize((N * s, N * s), Image.NEAREST)
    if bg:
        base = Image.new("RGBA", big.size, hx(bg))
        base.alpha_composite(big)
        return base
    return big


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    tiles = []
    for name, (_, _, bg) in OUTFITS.items():
        for expr in ("neutral", "blink", "talk", "smirk"):
            img = build(name, expr)
            img.save(OUT / f"{name}_{expr}_64.png")
            scaled(img, 16).save(OUT / f"{name}_{expr}.png")
        tiles.append(scaled(build(name), 6, bg))
    # folha com todas as roupas (5 x 2)
    w, h = tiles[0].size
    sheet = Image.new("RGBA", (w * 5 + 6 * 12, h * 2 + 3 * 12), hx("#0a0a10"))
    for i, t in enumerate(tiles):
        sheet.alpha_composite(t, (12 + (i % 5) * (w + 12), 12 + (i // 5) * (h + 12)))
    sheet.save(OUT / "_todas_as_roupas.png")
    print("ok", len(tiles), "roupas")
