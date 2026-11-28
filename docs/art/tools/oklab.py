import numpy as np
def srgb_to_linear(c):
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def linear_to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1/2.4) - 0.055) * 255.0
def rgb_to_oklab(rgb):
    rgb = np.asarray(rgb, dtype=np.float64)
    l = srgb_to_linear(rgb)
    r, g, b = l[..., 0], l[..., 1], l[..., 2]
    L = 0.4122214708*r + 0.5363325363*g + 0.0514459929*b
    M = 0.2119034982*r + 0.6806995451*g + 0.1073969566*b
    S = 0.0883024619*r + 0.2817188376*g + 0.6299787005*b
    L_, M_, S_ = np.cbrt(L), np.cbrt(M), np.cbrt(S)
    return np.stack([0.2104542553*L_ + 0.7936177850*M_ - 0.0040720468*S_,
                     1.9779984951*L_ - 2.4285922050*M_ + 0.4505937099*S_,
                     0.0259040371*L_ + 0.7827717662*M_ - 0.8086757660*S_], axis=-1)
def oklab_to_rgb(lab):
    lab = np.asarray(lab, dtype=np.float64)
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    L_ = L + 0.3963377774*a + 0.2158037573*b
    M_ = L - 0.1055613458*a - 0.0638541728*b
    S_ = L - 0.0894841775*a - 1.2914855480*b
    l, m, s = L_**3, M_**3, S_**3
    r = 4.0767416621*l - 3.3077115913*m + 0.2309699292*s
    g = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s
    bb = -0.0041960863*l - 0.7034186147*m + 1.7076147010*s
    return linear_to_srgb(np.stack([r, g, bb], axis=-1))
def hexs(rgb):
    r, g, b = [int(round(float(x))) for x in rgb]
    return f'#{r:02X}{g:02X}{b:02X}'
