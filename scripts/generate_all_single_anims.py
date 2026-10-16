import os, math, random
import cv2
import numpy as np
from PIL import Image

def blend_patch(base, patch, mask, x1, y1):
    h, w, _ = patch.shape
    roi = base[y1:y1+h, x1:x1+w]
    if roi.shape != patch.shape:
        return
    for c in range(3):
        roi[:, :, c] = (patch[:, :, c] * mask + roi[:, :, c] * (1.0 - mask)).astype(np.uint8)

def create_circular_mask(h, w):
    mask = np.zeros((h, w), dtype=np.float32)
    cv2.ellipse(mask, (w//2, h//2), (w//2 - 2, h//2 - 2), 0, 0, 360, 1.0, -1)
    mask = cv2.GaussianBlur(mask, (15, 15), 5)
    return mask

# =========================================================================
# 1. SINGLE MACHINE: CALL CENTER (Teleoperadora Hablando y Tecleando)
# =========================================================================
def build_single_call_center():
    path = 'assets/machines/call_center.jpg'
    base = cv2.imread(path)
    if base is None:
        print("Missing:", path)
        return
    h, w, _ = base.shape
    print(f"Building single call center animation from {w}x{h}...")

    N_FRAMES = 24
    frames = []

    # Mouth exact coordinates:
    # center is around (645, 438). Range x: 625..668, y: 418..458
    mx1, my1, mx2, my2 = 625, 418, 668, 458
    mw, mh = mx2 - mx1, my2 - my1
    mouth_orig = base[my1:my2, mx1:mx2].copy()

    # Hands on keyboard: x: 340..510, y: 720..880
    hx1, hy1, hx2, hy2 = 340, 720, 510, 880
    hw, hh = hx2 - hx1, hy2 - hy1
    hand_orig = base[hy1:hy2, hx1:hx2].copy()

    # Head zone: x: 600..820, y: 190..520
    head_x1, head_y1, head_x2, head_y2 = 600, 190, 820, 520
    head_w, head_h = head_x2 - head_x1, head_y2 - head_y1
    head_orig = base[head_y1:head_y2, head_x1:head_x2].copy()

    for i in range(N_FRAMES):
        f = base.copy()
        t = i / N_FRAMES
        angle = t * 2 * math.pi

        # A) Natural head nodding / speech rhythm (subtle 2.8 px vertical, 1.0 px horizontal)
        nod_y = 2.8 * math.cos(angle * 2)
        nod_x = 1.0 * math.sin(angle)
        M_head = np.float32([[1, 0, nod_x], [0, 1, nod_y]])
        head_warped = cv2.warpAffine(head_orig, M_head, (head_w, head_h), borderMode=cv2.BORDER_REFLECT)
        
        # Soft mask for head
        mask_head = np.zeros((head_h, head_w), dtype=np.float32)
        cv2.ellipse(mask_head, (head_w//2, head_h//2), (head_w//2 - 10, head_h//2 - 10), 0, 0, 360, 1.0, -1)
        mask_head = cv2.GaussianBlur(mask_head, (25, 25), 10)
        blend_patch(f, head_warped, mask_head, head_x1, head_y1)

        # B) Realistic Lip & Jaw Articulation (Phonetic Visemes)
        # 3 syllables per cycle: "Hola, buenos días..."
        speech_val = math.sin(angle * 3)
        jaw_drop = max(0.0, speech_val) * 7.0  # up to 7 pixels of jaw drop
        
        # Remap lower lip down
        map_x = np.zeros((mh, mw), dtype=np.float32)
        map_y = np.zeros((mh, mw), dtype=np.float32)
        for y in range(mh):
            factor = (y / float(mh)) ** 1.6
            disp_y = -jaw_drop * factor + nod_y
            for x in range(mw):
                map_x[y, x] = x + nod_x
                map_y[y, x] = y + disp_y
        mouth_warped = cv2.remap(mouth_orig, map_x, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

        # Draw real mouth opening with teeth and dark oral cavity when jaw drops
        if jaw_drop > 2.0:
            open_h = int((jaw_drop - 2.0) * 0.75)
            # Oral cavity
            cv2.ellipse(mouth_warped, (int(mw * 0.48), int(mh * 0.48)), 
                        (int(mw * 0.24), max(1, open_h)), -6, 0, 360, (30, 20, 35), -1)
            # Upper teeth row highlight
            if open_h >= 2:
                cv2.ellipse(mouth_warped, (int(mw * 0.48), int(mh * 0.44)), 
                            (int(mw * 0.18), 1), -6, 0, 360, (230, 230, 235), -1)

        # Blend mouth back over face
        mask_m = np.zeros((mh, mw), dtype=np.float32)
        cv2.ellipse(mask_m, (mw//2, mh//2), (int(mw*0.46), int(mh*0.46)), 0, 0, 360, 1.0, -1)
        mask_m = cv2.GaussianBlur(mask_m, (11, 11), 4)
        blend_patch(f, mouth_warped, mask_m, mx1, my1)

        # C) Headset Microphone Boom & Pulsing Green Call LED
        mic_x = int(642 + nod_x)
        mic_y = int(465 + nod_y + jaw_drop * 0.2)
        led_glow = 0.5 + 0.5 * math.sin(angle * 8)
        led_col = (int(60 * led_glow), int(240 * led_glow), int(90 * led_glow))
        cv2.circle(f, (mic_x, mic_y), 4, led_col, -1)
        cv2.circle(f, (mic_x, mic_y), 7, (int(30 * led_glow), int(160 * led_glow), int(50 * led_glow)), 1)

        # D) Keyboard Typing Motion (fingers tapping keys)
        tap_y = math.sin(angle * 8) * 3.0
        M_tap = np.float32([[1, 0, 0], [0, 1, tap_y]])
        hand_warped = cv2.warpAffine(hand_orig, M_tap, (hw, hh), borderMode=cv2.BORDER_REFLECT)
        mask_h = np.zeros((hh, hw), dtype=np.float32)
        cv2.ellipse(mask_h, (hw//2, hh//2), (hw//2 - 5, hh//2 - 5), 0, 0, 360, 1.0, -1)
        mask_h = cv2.GaussianBlur(mask_h, (17, 17), 6)
        blend_patch(f, hand_warped, mask_h, hx1, hy1)

        # E) Screen cursor blinking
        if (i // 4) % 2 == 0:
            cv2.line(f, (230, 480), (230, 500), (0, 180, 255), 2)

        # F) Background teleoperator agents talking/gesturing
        b1_x1, b1_y1, b1_x2, b1_y2 = 50, 140, 180, 300
        b1_nod = 2.0 * math.cos(angle * 3 + 1.2)
        M_b1 = np.float32([[1, 0, 0], [0, 1, b1_nod]])
        b1_crop = base[b1_y1:b1_y2, b1_x1:b1_x2].copy()
        f[b1_y1:b1_y2, b1_x1:b1_x2] = cv2.warpAffine(b1_crop, M_b1, (b1_x2-b1_x1, b1_y2-b1_y1), borderMode=cv2.BORDER_REFLECT)

        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        frames.append(Image.fromarray(rgb))

    out_p = 'assets/machines/call_center_animated.webp'
    frames[0].save(out_p, save_all=True, append_images=frames[1:], duration=60, loop=0, quality=90, method=4)
    print(f"Generated {out_p} ({len(frames)} frames)")

# =========================================================================
# 2. SINGLE MACHINE: CORTADORA DE CONCRETO (4200 RPM, Agua y Chispas)
# =========================================================================
def build_single_cortadora():
    path = 'assets/machines/cortadora_disco_concreto.jpg'
    base = cv2.imread(path)
    if base is None:
        print("Missing:", path)
        return
    h, w, _ = base.shape
    print(f"Building single cortadora animation from {w}x{h}...")

    N_FRAMES = 20
    frames = []
    random.seed(101)

    # Disc center: (670, 720), radius ~110
    cx, cy, r = 670, 720, 110
    # Engine & Worker arms zone: x: 380..720, y: 460..760
    ex1, ey1, ex2, ey2 = 380, 460, 720, 760
    ew, eh = ex2 - ex1, ey2 - ey1
    engine_orig = base[ey1:ey2, ex1:ex2].copy()

    for i in range(N_FRAMES):
        f = base.copy()
        t = i / N_FRAMES
        angle = t * 2 * math.pi

        # A) 50 Hz Heavy Engine Vibration (1.5 px jitter)
        vib_x = 1.5 * math.sin(angle * 7)
        vib_y = 1.2 * math.cos(angle * 7)
        M_vib = np.float32([[1, 0, vib_x], [0, 1, vib_y]])
        eng_warped = cv2.warpAffine(engine_orig, M_vib, (ew, eh), borderMode=cv2.BORDER_REFLECT)
        mask_e = np.zeros((eh, ew), dtype=np.float32)
        cv2.ellipse(mask_e, (ew//2, eh//2), (ew//2 - 10, eh//2 - 10), 0, 0, 360, 1.0, -1)
        mask_e = cv2.GaussianBlur(mask_e, (21, 21), 8)
        blend_patch(f, eng_warped, mask_e, ex1, ey1)

        # B) 4200 RPM Diamond Disc Spinning Blur & Rotating Teeth
        disc_rot_angle = t * 360 * 3 # spins 3 full turns across loop
        disc_crop = f[cy-r:cy+r, cx-r:cx+r].copy()
        M_rot = cv2.getRotationMatrix2D((r, r), disc_rot_angle, 1.0)
        disc_rot = cv2.warpAffine(disc_crop, M_rot, (2*r, 2*r), borderMode=cv2.BORDER_REFLECT)
        # Apply radial motion blur ring
        disc_mask = np.zeros((2*r, 2*r), dtype=np.float32)
        cv2.circle(disc_mask, (r, r), r - 5, 1.0, -1)
        cv2.circle(disc_mask, (r, r), int(r * 0.35), 0.0, -1) # arbor nut static
        disc_mask = cv2.GaussianBlur(disc_mask, (11, 11), 3)
        blend_patch(f, disc_rot, disc_mask, cx-r, cy-r)

        # C) Cutting Friction Sparks at Contact Point (530..680, 780..830)
        contact_x = int(615 + vib_x)
        contact_y = int(805 + vib_y)
        # Incandescent contact spot glow
        cv2.circle(f, (contact_x, contact_y), 6, (200, 255, 255), -1)
        cv2.circle(f, (contact_x, contact_y), 15, (0, 160, 255), 2)

        # Spray of orange sparks trailing backwards (towards x=350..550, y=700..830)
        for _ in range(40):
            sp_len = random.uniform(15, 180)
            sp_ang = random.uniform(math.pi * 0.85, math.pi * 1.15)
            sx = int(contact_x + sp_len * math.cos(sp_ang))
            sy = int(contact_y + sp_len * math.sin(sp_ang) * 0.5 - random.uniform(0, 40))
            if 0 <= sx < w and 0 <= sy < h:
                sp_col = (random.randint(180, 255), random.randint(140, 240), random.randint(0, 100))
                cv2.circle(f, (sx, sy), random.randint(1, 3), sp_col, -1)
                # trailing streak
                cv2.line(f, (sx, sy), (sx + random.randint(4, 12), sy + random.randint(-2, 2)), sp_col, 1)

        # D) High-pressure Water Vapor and Slurry Spray
        for _ in range(30):
            m_dist = random.uniform(10, 140)
            m_ang = random.uniform(math.pi * 0.75, math.pi * 1.2)
            mx = int(contact_x + m_dist * math.cos(m_ang))
            my = int(contact_y + m_dist * math.sin(m_ang) * 0.4)
            if 0 <= mx < w and 0 <= my < h:
                alpha = max(0.1, 1.0 - m_dist / 140.0) * 0.4
                m_col = (int(220 * alpha), int(225 * alpha), int(220 * alpha))
                cv2.circle(f, (mx, my), random.randint(3, 9), (220, 225, 220), -1)

        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        frames.append(Image.fromarray(rgb))

    out_p = 'assets/machines/cortadora_disco_animated.webp'
    frames[0].save(out_p, save_all=True, append_images=frames[1:], duration=50, loop=0, quality=90, method=4)
    print(f"Generated {out_p} ({len(frames)} frames)")

# =========================================================================
# 3. SINGLE MACHINE: MARTILLO NEUMATICO (26 Hz Percusion y Fractura)
# =========================================================================
def build_single_martillo():
    path = 'assets/machines/martillo_neumatico.jpg'
    base = cv2.imread(path)
    if base is None:
        print("Missing:", path)
        return
    h, w, _ = base.shape
    print(f"Building single martillo animation from {w}x{h}...")

    N_FRAMES = 20
    frames = []
    random.seed(202)

    # Chisel contact: (575, 830)
    # Hammer body + worker hands: x: 380..630, y: 350..850
    hx1, hy1, hx2, hy2 = 380, 350, 630, 850
    hw, hh = hx2 - hx1, hy2 - hy1
    hammer_orig = base[hy1:hy2, hx1:hx2].copy()

    # Worker torso + helmet: x: 330..620, y: 50..450
    tx1, ty1, tx2, ty2 = 330, 50, 620, 450
    tw, th = tx2 - tx1, ty2 - ty1
    torso_orig = base[ty1:ty2, tx1:tx2].copy()

    for i in range(N_FRAMES):
        f = base.copy()
        t = i / N_FRAMES
        angle = t * 2 * math.pi

        # Severe 26 Hz pneumatic hammer reciprocation (14 px stroke)
        # Sharp impact downwards, slower spring recovery
        stroke = 14.0 * (1.0 - math.cos(angle * 4)) * 0.5
        M_hammer = np.float32([[1, 0, 0], [0, 1, stroke]])
        hammer_warped = cv2.warpAffine(hammer_orig, M_hammer, (hw, hh), borderMode=cv2.BORDER_REFLECT)
        mask_h = np.zeros((hh, hw), dtype=np.float32)
        cv2.ellipse(mask_h, (hw//2, hh//2), (hw//2 - 8, hh//2 - 8), 0, 0, 360, 1.0, -1)
        mask_h = cv2.GaussianBlur(mask_h, (25, 25), 9)
        blend_patch(f, hammer_warped, mask_h, hx1, hy1)

        # Worker HAV vibration (reaction shock shaking arms and helmet)
        worker_vib_y = 4.0 * math.sin(angle * 4)
        worker_vib_x = 2.0 * math.cos(angle * 2)
        M_worker = np.float32([[1, 0, worker_vib_x], [0, 1, worker_vib_y]])
        torso_warped = cv2.warpAffine(torso_orig, M_worker, (tw, th), borderMode=cv2.BORDER_REFLECT)
        mask_t = np.zeros((th, tw), dtype=np.float32)
        cv2.ellipse(mask_t, (tw//2, th//2), (tw//2 - 10, th//2 - 10), 0, 0, 360, 1.0, -1)
        mask_t = cv2.GaussianBlur(mask_t, (25, 25), 9)
        blend_patch(f, torso_warped, mask_t, tx1, ty1)

        # Concrete fracture impact shockwave & exploding dust cloud
        pt_x = 575
        pt_y = int(830 + stroke * 0.5)

        # Shockwave ring
        if (i % 5) < 3:
            ring_r = int(10 + (i % 5) * 22)
            cv2.ellipse(f, (pt_x, pt_y), (ring_r, int(ring_r * 0.45)), 0, 0, 360, (230, 240, 245), 2)

        # Flying concrete chips & airborne dust cloud
        for _ in range(35):
            d_x = random.uniform(20, 250)
            d_y = random.uniform(-140, 40)
            px = int(pt_x + d_x)
            py = int(pt_y + d_y)
            if 0 <= px < w and 0 <= py < h:
                # White-grey concrete dust
                grey = random.randint(190, 245)
                sz = random.randint(2, 8)
                cv2.circle(f, (px, py), sz, (grey, grey, grey), -1)

        # Air exhaust blast from tool cylinder
        cv2.line(f, (510, 580), (450 + random.randint(-15, 15), 560 + random.randint(-10, 10)), (230, 235, 240), 3)

        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        frames.append(Image.fromarray(rgb))

    out_p = 'assets/machines/martillo_neumatico_animated.webp'
    frames[0].save(out_p, save_all=True, append_images=frames[1:], duration=50, loop=0, quality=90, method=4)
    print(f"Generated {out_p} ({len(frames)} frames)")

# =========================================================================
# 4. SINGLE MACHINE: PULIDORA INDUSTRIAL (8500 RPM y Cascada de Chispas)
# =========================================================================
def build_single_pulidora():
    path = 'assets/machines/pulidora_bosch_gws.jpg'
    base = cv2.imread(path)
    if base is None:
        print("Missing:", path)
        return
    h, w, _ = base.shape
    print(f"Building single pulidora animation from {w}x{h}...")

    N_FRAMES = 20
    frames = []
    random.seed(303)

    # Grinder contact point on steel beam: (490, 560)
    # Grinder body: x: 330..530, y: 480..620
    gx1, gy1, gx2, gy2 = 330, 480, 530, 620
    gw, gh = gx2 - gx1, gy2 - gy1
    grinder_orig = base[gy1:gy2, gx1:gx2].copy()

    for i in range(N_FRAMES):
        f = base.copy()
        t = i / N_FRAMES
        angle = t * 2 * math.pi

        # High speed 8500 RPM tool jitter
        gvib_x = 1.2 * math.sin(angle * 8)
        gvib_y = 1.0 * math.cos(angle * 8)
        M_gvib = np.float32([[1, 0, gvib_x], [0, 1, gvib_y]])
        grind_warped = cv2.warpAffine(grinder_orig, M_gvib, (gw, gh), borderMode=cv2.BORDER_REFLECT)
        mask_g = np.zeros((gh, gw), dtype=np.float32)
        cv2.ellipse(mask_g, (gw//2, gh//2), (gw//2 - 6, gh//2 - 6), 0, 0, 360, 1.0, -1)
        mask_g = cv2.GaussianBlur(mask_g, (19, 19), 7)
        blend_patch(f, grind_warped, mask_g, gx1, gy1)

        # White hot contact spot
        cx, cy = 490, 560
        cv2.circle(f, (cx, cy), 8, (255, 255, 255), -1)
        cv2.circle(f, (cx, cy), 18, (0, 170, 255), -1)

        # Spectacular giant cascade of incandescent sparks towards (500..1200, 200..600)
        for _ in range(80):
            dist = random.uniform(30, 650)
            sp_ang = random.uniform(-0.65, 0.45) # shoots up and to the right
            sx = int(cx + dist * math.cos(sp_ang))
            sy = int(cy + dist * math.sin(sp_ang) + 0.0007 * (dist ** 2)) # gravity curve
            if 0 <= sx < w and 0 <= sy < h:
                col = (random.randint(200, 255), random.randint(180, 255), random.randint(50, 200))
                cv2.circle(f, (sx, sy), random.randint(1, 3), col, -1)
                # spark tail
                cv2.line(f, (sx, sy), (sx - random.randint(5, 18), sy - random.randint(-4, 6)), col, 1)

        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        frames.append(Image.fromarray(rgb))

    out_p = 'assets/machines/pulidora_bosch_gws_animated.webp'
    frames[0].save(out_p, save_all=True, append_images=frames[1:], duration=50, loop=0, quality=90, method=4)
    print(f"Generated {out_p} ({len(frames)} frames)")

# =========================================================================
# 5. SINGLE MACHINE: MEZCLADORA TROMPO (Tambor Rotativo y Aridos)
# =========================================================================
def build_single_mezcladora():
    path = 'assets/machines/mezcladora_trompo.jpg'
    base = cv2.imread(path)
    if base is None:
        print("Missing:", path)
        return
    h, w, _ = base.shape
    print(f"Building single mezcladora animation from {w}x{h}...")

    N_FRAMES = 20
    frames = []

    # Drum barrel: x: 550..1100, y: 250..750
    dx1, dy1, dx2, dy2 = 550, 250, 1100, 750
    dw, dh = dx2 - dx1, dy2 - dy1
    drum_orig = base[dy1:dy2, dx1:dx2].copy()

    for i in range(N_FRAMES):
        f = base.copy()
        t = i / N_FRAMES
        angle = t * 2 * math.pi

        # Drum rotation oscillation & vibration
        drum_vib_y = 2.5 * math.sin(angle * 3)
        drum_rot = t * 360 # continuous drum rotation
        M_drum = cv2.getRotationMatrix2D((dw//2, dh//2), drum_rot * 0.15, 1.0)
        drum_warped = cv2.warpAffine(drum_orig, M_drum, (dw, dh), borderMode=cv2.BORDER_REFLECT)
        mask_d = np.zeros((dh, dw), dtype=np.float32)
        cv2.ellipse(mask_d, (dw//2, dh//2), (dw//2 - 15, dh//2 - 15), 0, 0, 360, 1.0, -1)
        mask_d = cv2.GaussianBlur(mask_d, (25, 25), 10)
        blend_patch(f, drum_warped, mask_d, dx1, dy1)

        # Worker shovel loading gravel micro-movement
        sx1, sy1, sx2, sy2 = 250, 280, 580, 480
        shov_crop = base[sy1:sy2, sx1:sx2].copy()
        shov_y = 3.0 * math.sin(angle * 2)
        M_shov = np.float32([[1, 0, 0], [0, 1, shov_y]])
        shov_warped = cv2.warpAffine(shov_crop, M_shov, (sx2-sx1, sy2-sy1), borderMode=cv2.BORDER_REFLECT)
        f[sy1:sy2, sx1:sx2] = shov_warped

        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        frames.append(Image.fromarray(rgb))

    out_p = 'assets/machines/mezcladora_trompo_animated.webp'
    frames[0].save(out_p, save_all=True, append_images=frames[1:], duration=60, loop=0, quality=90, method=4)
    print(f"Generated {out_p} ({len(frames)} frames)")

# =========================================================================
# 6. SINGLE MACHINE: VIBROCOMPACTADOR (Compactacion y Rodillo)
# =========================================================================
def build_single_vibro():
    path = 'assets/machines/vibrocompactador_pata_cabra.jpg'
    base = cv2.imread(path)
    if base is None:
        print("Missing:", path)
        return
    h, w, _ = base.shape
    print(f"Building single vibro animation from {w}x{h}...")

    N_FRAMES = 20
    frames = []

    # Roller & Cab: x: 150..1200, y: 100..900
    for i in range(N_FRAMES):
        f = base.copy()
        t = i / N_FRAMES
        angle = t * 2 * math.pi

        # 30 Hz heavy seismic vibration
        svib_y = 2.0 * math.sin(angle * 6)
        svib_x = 1.0 * math.cos(angle * 6)
        M_s = np.float32([[1, 0, svib_x], [0, 1, svib_y]])
        f = cv2.warpAffine(base, M_s, (w, h), borderMode=cv2.BORDER_REPLICATE)

        # Ground dust vibrating off the treads
        for _ in range(25):
            gx = random.randint(450, 1150)
            gy = random.randint(700, 880)
            sz = random.randint(2, 6)
            cv2.circle(f, (gx, gy), sz, (170, 160, 140), -1)

        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        frames.append(Image.fromarray(rgb))

    out_p = 'assets/machines/vibrocompactador_pata_cabra_animated.webp'
    frames[0].save(out_p, save_all=True, append_images=frames[1:], duration=50, loop=0, quality=90, method=4)
    print(f"Generated {out_p} ({len(frames)} frames)")

if __name__ == '__main__':
    build_single_call_center()
    build_single_cortadora()
    build_single_martillo()
    build_single_pulidora()
    build_single_mezcladora()
    build_single_vibro()
    print("ALL SINGLE ANIMATIONS COMPLETED SUCCESSFULLY!")
