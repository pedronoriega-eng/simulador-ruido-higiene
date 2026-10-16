import cv2
import numpy as np
import math, random
from PIL import Image

def generate_call_center_animated():
    img_path = 'assets/machines/call_center.jpg'
    base = cv2.imread(img_path)
    if base is None:
        print("Error: Could not load call center image")
        return
    h, w, c = base.shape
    print(f"Loaded {img_path}: {w}x{h}")

    N_FRAMES = 24  # 24 frames loop @ 15 FPS = 1.6s speech cadence loop
    FRAME_DURATION_MS = 65

    # Target zones for Call Center teleoperator:
    # Mouth/jaw zone: x in [460, 530], y in [560, 645]
    # Head zone: x in [440, 620], y in [380, 660]
    # Hands/keyboard: x in [270, 420], y in [760, 880]
    # CRM Screen cursor/content: x in [80, 260], y in [420, 680]
    # Background agents:
    # Agent 1 (left): x in [70, 180], y in [380, 520]
    # Agent 2 (mid-left): x in [180, 270], y in [360, 480]
    # Agent 3 (right): x in [580, 680], y in [380, 540]

    frames_pil = []

    for i in range(N_FRAMES):
        f = base.copy()
        t = i / N_FRAMES
        angle = t * 2 * math.pi

        # -------------------------------------------------------------
        # 1. HEAD & JAW SPEECH MOVEMENT (Visemes & Natural Nodding)
        # -------------------------------------------------------------
        # Head gentle nod while talking (subtle 2.5 px vertical, 1.2 px horizontal)
        head_dx = 1.2 * math.sin(angle)
        head_dy = 2.2 * math.cos(angle * 2)

        # Mouth opening/closing (speech syllable rhythm - 3 syllables per cycle)
        # Viseme aperture: 0 = closed/neutral, 1 = open "ah/oh", 0.5 = "ee/te"
        speech_phase = math.sin(angle * 3)
        jaw_drop = max(0, speech_phase) * 6.5 # drops down up to 6.5 px

        # Warp the lower jaw & mouth region
        # Mouth box: x=465..535, y=565..645
        mx1, my1, mx2, my2 = 465, 565, 535, 645
        mouth_crop = f[my1:my2, mx1:mx2].copy()
        mw, mh = mx2 - mx1, my2 - my1

        # Affine warp for jaw opening: stretch bottom half downwards
        # Using mesh warp or piecewise affine
        src_pts = np.float32([
            [0, 0], [mw-1, 0],
            [0, mh*0.4], [mw-1, mh*0.4],
            [0, mh-1], [mw-1, mh-1]
        ])
        dst_pts = np.float32([
            [0, 0], [mw-1, 0],
            [0, mh*0.4 + jaw_drop*0.3], [mw-1, mh*0.4 + jaw_drop*0.3],
            [0, mh-1 + jaw_drop], [mw-1, mh-1 + jaw_drop]
        ])
        # Two affine triangles/quads
        # Top half
        M_top = cv2.getAffineTransform(src_pts[:3], dst_pts[:3])
        # We can do a smooth remap
        map_x = np.zeros((mh, mw), dtype=np.float32)
        map_y = np.zeros((mh, mw), dtype=np.float32)
        for y_idx in range(mh):
            # displacement factor increases towards bottom
            factor = (y_idx / float(mh)) ** 1.5
            disp_y = -jaw_drop * factor
            for x_idx in range(mw):
                map_x[y_idx, x_idx] = x_idx
                map_y[y_idx, x_idx] = y_idx + disp_y

        warped_mouth = cv2.remap(mouth_crop, map_x, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        
        # When jaw drops, draw natural darker lip separation (mouth interior)
        if jaw_drop > 2.0:
            lip_y = int(my1 + mh * 0.45 + jaw_drop * 0.4)
            lip_x1 = int(mx1 + mw * 0.25)
            lip_x2 = int(mx1 + mw * 0.70)
            aperture_h = int((jaw_drop - 2.0) * 0.7)
            cv2.ellipse(warped_mouth, (int(mw * 0.48), int(mh * 0.45)), 
                        (int(mw * 0.22), max(1, aperture_h)), 
                        -5, 0, 360, (40, 30, 50), -1)
            # subtle tooth highlight
            if aperture_h >= 2:
                cv2.ellipse(warped_mouth, (int(mw * 0.48), int(mh * 0.43)), 
                            (int(mw * 0.16), 1), 
                            -5, 0, 360, (210, 210, 220), -1)

        # Blend warped mouth smoothly into face
        mask = np.zeros((mh, mw), dtype=np.float32)
        cv2.ellipse(mask, (int(mw*0.5), int(mh*0.5)), (int(mw*0.45), int(mh*0.45)), 0, 0, 360, 1.0, -1)
        mask = cv2.GaussianBlur(mask, (15, 15), 5)
        for c_idx in range(3):
            f[my1:my2, mx1:mx2, c_idx] = (
                warped_mouth[:, :, c_idx] * mask + f[my1:my2, mx1:mx2, c_idx] * (1.0 - mask)
            ).astype(np.uint8)

        # -------------------------------------------------------------
        # 2. HEADSET MICROPHONE ACTIVE TRANSMISSION GLOW
        # -------------------------------------------------------------
        # Mic tip is near x=495, y=595
        mic_x = int(495 + head_dx)
        mic_y = int(595 + head_dy + jaw_drop * 0.2)
        
        # Audio active pulsating LED on headset boom
        led_pulse = 0.5 + 0.5 * math.sin(angle * 6)
        led_color = (int(80 * led_pulse), int(220 * led_pulse), int(100 * led_pulse)) # green LED
        cv2.circle(f, (mic_x, mic_y), 3, led_color, -1)
        cv2.circle(f, (mic_x, mic_y), 5, (int(40*led_pulse), int(180*led_pulse), int(60*led_pulse)), 1)

        # -------------------------------------------------------------
        # 3. TYPING HANDS ON KEYBOARD
        # -------------------------------------------------------------
        # Hands zone: x=280..420, y=780..880
        # Alternating finger keystrokes
        hx1, hy1, hx2, hy2 = 280, 780, 420, 880
        hand_crop = f[hy1:hy2, hx1:hx2].copy()
        hw, hh = hx2 - hx1, hy2 - hy1
        
        # Keystroke micro-vibrations
        type_tap = math.sin(angle * 8) * 2.5
        M_type = np.float32([[1, 0, 0], [0, 1, type_tap]])
        warped_hand = cv2.warpAffine(hand_crop, M_type, (hw, hh), borderMode=cv2.BORDER_REFLECT)
        
        # Blend hand typing
        f[hy1:hy2, hx1:hx2] = warped_hand

        # -------------------------------------------------------------
        # 4. BACKGROUND TELEOPERATORS (Gesturing and Speaking)
        # -------------------------------------------------------------
        # Agent 1 (left): nodding/talking at different frequency
        bg1_dx = 1.0 * math.sin(angle * 1.5 + 1.0)
        bg1_dy = 1.5 * math.cos(angle * 2.5 + 0.5)
        b1_x1, b1_y1, b1_x2, b1_y2 = 70, 380, 180, 520
        b1_crop = f[b1_y1:b1_y2, b1_x1:b1_x2].copy()
        M_b1 = np.float32([[1, 0, bg1_dx], [0, 1, bg1_dy]])
        f[b1_y1:b1_y2, b1_x1:b1_x2] = cv2.warpAffine(b1_crop, M_b1, (b1_x2-b1_x1, b1_y2-b1_y1), borderMode=cv2.BORDER_REFLECT)

        # Agent 3 (right): speaking on phone
        bg3_dy = 1.8 * math.sin(angle * 2.0 + 2.0)
        b3_x1, b3_y1, b3_x2, b3_y2 = 580, 380, 680, 540
        b3_crop = f[b3_y1:b3_y2, b3_x1:b3_x2].copy()
        M_b3 = np.float32([[1, 0, 0], [0, 1, bg3_dy]])
        f[b3_y1:b3_y2, b3_x1:b3_x2] = cv2.warpAffine(b3_crop, M_b3, (b3_x2-b3_x1, b3_y2-b3_y1), borderMode=cv2.BORDER_REFLECT)

        # -------------------------------------------------------------
        # 5. CRM MONITOR SCREEN (Active Cursor & Scanlines)
        # -------------------------------------------------------------
        # Screen is at x: 100..250, y: 450..650
        scr_x1, scr_y1, scr_x2, scr_y2 = 110, 460, 240, 640
        # Draw a blinking cursor or active chat line
        if (i // 4) % 2 == 0:
            cv2.line(f, (180, 520), (180, 535), (20, 120, 240), 2)
        # subtle screen scanline drift
        scan_y = int(scr_y1 + (t * (scr_y2 - scr_y1)))
        cv2.line(f, (scr_x1, scan_y), (scr_x2, scan_y), (255, 255, 255), 1)

        # Convert to PIL Image (RGB)
        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        frames_pil.append(Image.fromarray(rgb))

    out_path_webp = 'assets/machines/call_center_animated.webp'
    out_path_gif = 'assets/machines/call_center_animated.gif'

    frames_pil[0].save(
        out_path_webp,
        save_all=True,
        append_images=frames_pil[1:],
        duration=FRAME_DURATION_MS,
        loop=0,
        quality=90,
        method=4
    )
    print(f"Saved animated WebP to {out_path_webp} (frames={N_FRAMES})")

if __name__ == '__main__':
    generate_call_center_animated()
