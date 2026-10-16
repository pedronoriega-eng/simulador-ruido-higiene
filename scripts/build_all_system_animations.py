import os, math, random
import cv2
import numpy as np
from PIL import Image

def safe_warp_patch(f, base, x1, y1, x2, y2, M):
    h_img, w_img, _ = base.shape
    x1 = max(0, min(x1, w_img - 1))
    x2 = max(0, min(x2, w_img))
    y1 = max(0, min(y1, h_img - 1))
    y2 = max(0, min(y2, h_img))
    w = x2 - x1
    h = y2 - y1
    if w <= 0 or h <= 0:
        return
    crop = base[y1:y2, x1:x2].copy()
    warped = cv2.warpAffine(crop, M, (w, h), borderMode=cv2.BORDER_REFLECT)
    f[y1:y2, x1:x2] = warped

# =========================================================================
# OVERVIEW SECTOR A: CONSTRUCCION (1376x768)
# =========================================================================
def build_overview_sector_a():
    path = 'assets/machines/sector_a_construccion_overview.jpg'
    base = cv2.imread(path)
    if base is None:
        print("Missing:", path)
        return
    h, w, _ = base.shape
    print(f"Generating animated overview Sector A from {w}x{h}...")

    N_FRAMES = 20
    frames = []
    random.seed(42)

    for i in range(N_FRAMES):
        f = base.copy()
        t = i / N_FRAMES
        angle = t * 2 * math.pi

        # 1. Cortadora de disco (worker at x: 80..240, y: 550..760)
        saw_vx = 1.2 * math.sin(angle * 8)
        saw_vy = 1.0 * math.cos(angle * 8)
        M_saw = np.float32([[1, 0, saw_vx], [0, 1, saw_vy]])
        safe_warp_patch(f, base, 80, 550, 240, 760, M_saw)
        # Cutting sparks & slurry at saw blade
        cx, cy = 175, 720
        for _ in range(15):
            sp_x = int(cx - random.uniform(5, 55))
            sp_y = int(cy + random.uniform(-15, 15))
            if 0 <= sp_x < w and 0 <= sp_y < h:
                cv2.circle(f, (sp_x, sp_y), random.randint(1, 2), (255, 200, random.randint(50, 150)), -1)
                cv2.circle(f, (sp_x + 5, sp_y), random.randint(2, 4), (220, 230, 230), -1)

        # 2. Mezcladora trompo (x: 310..410, y: 250..390)
        M_drum = cv2.getRotationMatrix2D((50, 70), t * 360 * 0.1, 1.0)
        safe_warp_patch(f, base, 310, 250, 410, 390, M_drum)

        # 3. Retroexcavadora (x: 470..660, y: 30..200)
        exc_dy = 2.0 * math.sin(angle * 2)
        M_exc = np.float32([[1, 0, 0], [0, 1, exc_dy]])
        safe_warp_patch(f, base, 470, 30, 660, 200, M_exc)
        cv2.circle(f, (600, int(80 + exc_dy)), random.randint(3, 7), (180, 180, 180), -1)

        # 4. Vibrocompactador (x: 860..970, y: 160..330)
        vib_y = 1.5 * math.sin(angle * 6)
        M_vib = np.float32([[1, 0, 0], [0, 1, vib_y]])
        safe_warp_patch(f, base, 860, 160, 970, 330, M_vib)

        # 5. Martillo neumático (x: 840..970, y: 550..760)
        jack_stroke = 7.0 * (1.0 - math.cos(angle * 4)) * 0.5
        M_jack = np.float32([[1, 0, 0], [0, 1, jack_stroke]])
        safe_warp_patch(f, base, 840, 550, 970, 760, M_jack)
        # Concrete dust puff
        for _ in range(12):
            dx = random.randint(-20, 25)
            dy = random.randint(-15, 10)
            if 0 <= 880 + dx < w and 0 <= 740 + dy < h:
                cv2.circle(f, (880 + dx, 740 + dy), random.randint(2, 6), (220, 220, 220), -1)

        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        frames.append(Image.fromarray(rgb))

    out_p = 'assets/machines/sector_a_construccion_animated.webp'
    frames[0].save(out_p, save_all=True, append_images=frames[1:], duration=50, loop=0, quality=90, method=4)
    print(f"Generated {out_p} ({len(frames)} frames)")

# =========================================================================
# OVERVIEW SECTOR E: SERVICIOS (1376x768)
# =========================================================================
def build_overview_sector_e():
    path = 'assets/machines/sector_e_servicios_overview.jpg'
    base = cv2.imread(path)
    if base is None:
        print("Missing:", path)
        return
    h, w, _ = base.shape
    print(f"Generating animated overview Sector E from {w}x{h}...")

    N_FRAMES = 24
    frames = []

    for i in range(N_FRAMES):
        f = base.copy()
        t = i / N_FRAMES
        angle = t * 2 * math.pi

        # 1. Call Center Operators (x: 230..470, y: 520..760)
        # Operator 1:
        op1_nod = 2.2 * math.cos(angle * 2.5)
        M_op1 = np.float32([[1, 0, 0], [0, 1, op1_nod]])
        safe_warp_patch(f, base, 240, 580, 310, 740, M_op1)
        cv2.circle(f, (280, int(625 + op1_nod)), 2, (0, 255, 100), -1)

        # Operator 2:
        op2_nod = 2.0 * math.sin(angle * 3.0)
        M_op2 = np.float32([[1, 0, 0], [0, 1, op2_nod]])
        safe_warp_patch(f, base, 370, 600, 445, 760, M_op2)
        cv2.circle(f, (415, int(635 + op2_nod)), 2, (0, 255, 100), -1)

        # 2. Data Center Server LEDs (x: 0..270, y: 220..730)
        for r_y in range(300, 650, 40):
            led_blink = 0.5 + 0.5 * math.sin(angle * 10 + r_y)
            cv2.circle(f, (60, r_y), 2, (int(255 * led_blink), int(100 * led_blink), 0), -1)
            cv2.circle(f, (100, r_y), 2, (0, int(255 * led_blink), int(100 * led_blink)), -1)

        # 3. Plotter de planos (x: 440..570, y: 390..530)
        carriage_x = int(470 + 40 * math.sin(angle * 2))
        cv2.line(f, (carriage_x, 440), (carriage_x + 6, 440), (0, 120, 255), 3)

        # 4. Cafeteria espresso steam (x: 580..800, y: 450..760)
        steam_y = int(510 - 20 * t)
        cv2.circle(f, (635, steam_y), int(3 + 8 * t), (230, 235, 240), -1)

        # 5. Street traffic through window (x: 800..1370, y: 150..550)
        for car_idx in range(5):
            car_x = int(850 + ((t * 400 + car_idx * 110) % 500))
            car_y = 420 + car_idx * 12
            cv2.line(f, (car_x, car_y), (car_x + 25, car_y), (random.randint(180, 255), random.randint(50, 180), random.randint(50, 180)), 4)

        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        frames.append(Image.fromarray(rgb))

    out_p = 'assets/machines/sector_e_servicios_animated.webp'
    frames[0].save(out_p, save_all=True, append_images=frames[1:], duration=60, loop=0, quality=90, method=4)
    print(f"Generated {out_p} ({len(frames)} frames)")

# =========================================================================
# OVERVIEW SECTOR B: MANUFACTURA (1376x768)
# =========================================================================
def build_overview_sector_b():
    path = 'assets/machines/sector_b_manufactura_overview.jpg'
    base = cv2.imread(path)
    if base is None:
        print("Missing:", path)
        return
    h, w, _ = base.shape
    print(f"Generating animated overview Sector B from {w}x{h}...")

    N_FRAMES = 20
    frames = []
    random.seed(55)

    for i in range(N_FRAMES):
        f = base.copy()
        t = i / N_FRAMES
        angle = t * 2 * math.pi

        # 1. Prensa excentrica (x: 70..250, y: 500..760)
        press_stroke = 8.0 * (1.0 - math.cos(angle * 3)) * 0.5
        M_press = np.float32([[1, 0, 0], [0, 1, press_stroke]])
        safe_warp_patch(f, base, 70, 500, 250, 760, M_press)

        # 2. Martinete de forja (x: 190..300, y: 390..630)
        forg_stroke = 10.0 * (1.0 - math.cos(angle * 4)) * 0.5
        M_forg = np.float32([[1, 0, 0], [0, 1, forg_stroke]])
        safe_warp_patch(f, base, 190, 390, 300, 630, M_forg)
        # Red hot steel glow & forge sparks
        cv2.circle(f, (245, 540), 10, (0, 120, 255), -1)
        for _ in range(8):
            cv2.circle(f, (245 + random.randint(-25, 25), 540 + random.randint(-20, 10)), 2, (0, 200, 255), -1)

        # 3. Pulidora en banco (x: 330..520, y: 540..760)
        gx, gy = 415, 660
        for _ in range(30):
            sp_len = random.uniform(10, 100)
            sp_ang = random.uniform(-0.5, 0.4)
            sx = int(gx + sp_len * math.cos(sp_ang))
            sy = int(gy + sp_len * math.sin(sp_ang) + 0.001 * (sp_len**2))
            if 0 <= sx < w and 0 <= sy < h:
                cv2.circle(f, (sx, sy), random.randint(1, 2), (0, 180, 255), -1)

        # 4. Ventilador centrifugo (x: 830..980, y: 520..740)
        M_fan = cv2.getRotationMatrix2D((40, 60), t * 360 * 2, 1.0)
        safe_warp_patch(f, base, 860, 540, 940, 660, M_fan)

        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        frames.append(Image.fromarray(rgb))

    out_p = 'assets/machines/sector_b_manufactura_animated.webp'
    frames[0].save(out_p, save_all=True, append_images=frames[1:], duration=50, loop=0, quality=90, method=4)
    print(f"Generated {out_p} ({len(frames)} frames)")

# =========================================================================
# OVERVIEW SECTOR C: COMERCIO Y OCIO (1376x768)
# =========================================================================
def build_overview_sector_c():
    path = 'assets/machines/sector_c_comercio_overview.jpg'
    base = cv2.imread(path)
    if base is None:
        print("Missing:", path)
        return
    h, w, _ = base.shape
    print(f"Generating animated overview Sector C from {w}x{h}...")

    N_FRAMES = 20
    frames = []
    random.seed(77)

    for i in range(N_FRAMES):
        f = base.copy()
        t = i / N_FRAMES
        angle = t * 2 * math.pi

        # 1. Karting pista (x: 130..230, y: 650..760)
        kart_dx = 3.0 * math.sin(angle * 4)
        M_kart = np.float32([[1, 0, kart_dx], [0, 1, 0]])
        safe_warp_patch(f, base, 130, 650, 230, 760, M_kart)

        # 2. Subwoofers discoteca (x: 140..350, y: 120..480)
        pump = 1.0 + 0.05 * math.sin(angle * 6)
        cv2.circle(f, (180, 360), int(16 * pump), (50, 50, 50), 2)
        cv2.circle(f, (230, 360), int(16 * pump), (50, 50, 50), 2)

        # 3. Bowling pistas (x: 660..980, y: 520..760)
        ball_y = int(580 + (t * 160))
        cv2.circle(f, (720, ball_y), 7, (200, 50, 30), -1)

        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        frames.append(Image.fromarray(rgb))

    out_p = 'assets/machines/sector_c_comercio_animated.webp'
    frames[0].save(out_p, save_all=True, append_images=frames[1:], duration=50, loop=0, quality=90, method=4)
    print(f"Generated {out_p} ({len(frames)} frames)")

# =========================================================================
# OVERVIEW SECTOR D: MINERIA (1376x768)
# =========================================================================
def build_overview_sector_d():
    path = 'assets/machines/sector_d_mineria_overview.jpg'
    base = cv2.imread(path)
    if base is None:
        print("Missing:", path)
        return
    h, w, _ = base.shape
    print(f"Generating animated overview Sector D from {w}x{h}...")

    N_FRAMES = 20
    frames = []
    random.seed(99)

    for i in range(N_FRAMES):
        f = base.copy()
        t = i / N_FRAMES
        angle = t * 2 * math.pi

        # 1. Voladura de banco (x: 80..280, y: 150..350)
        for _ in range(20):
            bx = random.randint(140, 260)
            by = random.randint(180, 300)
            cv2.circle(f, (bx, by), random.randint(6, 18), (190, 185, 175), -1)

        # 2. Jumbo de perforacion (x: 260..450, y: 460..640)
        drill_vib = 2.0 * math.sin(angle * 8)
        M_drill = np.float32([[1, 0, drill_vib], [0, 1, 0]])
        safe_warp_patch(f, base, 260, 460, 450, 640, M_drill)

        # 3. Trituradora de mandibulas (x: 490..670, y: 210..390)
        crush_y = 3.0 * math.sin(angle * 4)
        M_crush = np.float32([[1, 0, 0], [0, 1, crush_y]])
        safe_warp_patch(f, base, 490, 210, 670, 390, M_crush)

        # 4. Criba / Zaranda vibratoria (x: 670..860, y: 370..530)
        screen_vib = 2.5 * math.sin(angle * 8)
        M_scr = np.float32([[1, 0, screen_vib], [0, 1, screen_vib]])
        safe_warp_patch(f, base, 670, 370, 860, 530, M_scr)

        # 5. Dumper minero 300T (x: 650..850, y: 600..760)
        dump_vib = 1.2 * math.sin(angle * 5)
        M_dump = np.float32([[1, 0, 0], [0, 1, dump_vib]])
        safe_warp_patch(f, base, 650, 600, 850, 760, M_dump)

        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        frames.append(Image.fromarray(rgb))

    out_p = 'assets/machines/sector_d_mineria_animated.webp'
    frames[0].save(out_p, save_all=True, append_images=frames[1:], duration=50, loop=0, quality=90, method=4)
    print(f"Generated {out_p} ({len(frames)} frames)")

if __name__ == '__main__':
    build_overview_sector_a()
    build_overview_sector_e()
    build_overview_sector_b()
    build_overview_sector_c()
    build_overview_sector_d()
    print("ALL 5 SECTOR OVERVIEW ANIMATED WEBPS READY!")
