import os, math, random
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def build_assets():
    source_path = r"C:\Users\Estudiante 08\.gemini\antigravity-ide\brain\4dc4bea9-b503-4af2-adda-bd6a8c43c98f\sector_a_wide_spread_1792160233853.jpg"
    out_dir = r"assets\machines"
    os.makedirs(out_dir, exist_ok=True)
    
    base_pil = Image.open(source_path)
    base_np = np.array(base_pil) # shape: (768, 1376, 3)
    h, w, c = base_np.shape
    print(f"Loaded base image: {w}x{h}")
    
    # 1. Save ultra-sharp base images
    base_pil.save(os.path.join(out_dir, "sector_a_construccion_static.jpg"), quality=96)
    base_pil.save(os.path.join(out_dir, "sector_a_construccion_overview.jpg"), quality=96)
    print("Saved static and overview JPEG images.")

    N_FRAMES = 20
    FRAME_DURATION_MS = 50 # 20 FPS smooth mechanical loop

    # =========================================================================
    # 1. CORTADORA DE DISCO
    # Worker: x in [110, 335], y in [450, 680]
    # Blade contact point: x=245, y=625
    # =========================================================================
    print("Generating anim_cortadora_disco...")
    cort_frames = []
    # Seed for reproducible realistic particles
    random.seed(42)
    
    for i in range(N_FRAMES):
        f = base_np.copy()
        t = i / N_FRAMES
        
        # High frequency motor vibration (0.8 px jitter)
        vib_x = int(round(0.8 * math.sin(t * math.pi * 8)))
        vib_y = int(round(0.6 * math.cos(t * math.pi * 8)))
        
        # Jitter the saw and worker hands
        x1, y1, x2, y2 = 140, 500, 310, 660
        sub = f[y1:y2, x1:x2].copy()
        M = np.float32([[1, 0, vib_x], [0, 1, vib_y]])
        f[y1:y2, x1:x2] = cv2.warpAffine(sub, M, (x2-x1, y2-y1), borderMode=cv2.BORDER_REPLICATE)
        
        # Draw dynamic cutting mist & water slurry spray shooting back from blade contact point
        contact_x = 245 + vib_x
        contact_y = 625 + vib_y
        
        overlay = f.copy()
        # Conical dust plume shooting backwards along the concrete cut (towards x=290, y=600..635)
        for p in range(35):
            dist = random.uniform(5, 75)
            angle = random.uniform(-0.35, 0.25) # directional backwards jet
            px = int(contact_x + dist * math.cos(angle))
            py = int(contact_y + dist * math.sin(angle) * 0.4)
            size = int(1.5 + dist * 0.08)
            alpha = max(0.1, 1.0 - (dist / 75.0)) * 0.7
            
            # White-grey slurry spray
            color = (int(235 + random.randint(-15, 15)), 
                     int(235 + random.randint(-15, 15)), 
                     int(230 + random.randint(-15, 15)))
            cv2.circle(overlay, (px, py), size, color, -1)
            
        # Bright contact friction glow / micro sparks
        cv2.circle(overlay, (contact_x, contact_y), 3, (255, 255, 220), -1)
        if i % 3 == 0:
            spark_x = contact_x + random.randint(-4, 12)
            spark_y = contact_y + random.randint(-8, 4)
            cv2.circle(overlay, (spark_x, spark_y), 1, (255, 240, 100), -1)

        f_blend = cv2.addWeighted(overlay, 0.45, f, 0.55, 0)
        # Apply only to cutting zone
        mask = np.zeros((h, w), dtype=np.uint8)
        cv2.ellipse(mask, (contact_x + 30, contact_y), (60, 25), 0, 0, 360, 255, -1)
        mask = cv2.GaussianBlur(mask, (15, 15), 0)
        mask_3d = np.repeat(mask[:, :, np.newaxis] / 255.0, 3, axis=2)
        f = (f_blend * mask_3d + f * (1.0 - mask_3d)).astype(np.uint8)

        cort_frames.append(Image.fromarray(f))
        
    cort_frames[0].save(os.path.join(out_dir, "anim_cortadora_disco.webp"), 
                        save_all=True, append_images=cort_frames[1:], duration=FRAME_DURATION_MS, loop=0, quality=92)
    cort_frames[0].save(os.path.join(out_dir, "anim_cortadora_disco.gif"), 
                        save_all=True, append_images=cort_frames[1:], duration=FRAME_DURATION_MS, loop=0)
    print("anim_cortadora_disco saved.")

    # =========================================================================
    # 2. MEZCLADORA TROMPO
    # Mixer: x in [410, 580], y in [190, 325]
    # Drum center: x=495, y=245, drum radius ~ 34
    # =========================================================================
    print("Generating anim_mezcladora_trompo...")
    mezc_frames = []
    cx, cy = 495, 248
    drum_r = 38
    
    for i in range(N_FRAMES):
        f = base_np.copy()
        t = i / N_FRAMES
        
        # Engine throb vibration (1 px)
        vib_y = int(round(1.0 * math.sin(t * math.pi * 4)))
        vib_x = int(round(0.5 * math.cos(t * math.pi * 4)))
        
        # Extract drum region and rotate continuously around tilted axis
        sub_drum = f[cy-drum_r:cy+drum_r, cx-drum_r:cx+drum_r].copy()
        angle = (t * 360.0) % 360.0
        M_rot = cv2.getRotationMatrix2D((drum_r, drum_r), angle, 1.0)
        rot_drum = cv2.warpAffine(sub_drum, M_rot, (drum_r*2, drum_r*2), borderMode=cv2.BORDER_REFLECT)
        
        # Circular drum mask with smooth feathered edge
        drum_mask = np.zeros((drum_r*2, drum_r*2), dtype=np.float32)
        cv2.circle(drum_mask, (drum_r, drum_r), drum_r - 2, 1.0, -1)
        drum_mask = cv2.GaussianBlur(drum_mask, (7, 7), 0)
        drum_mask_3d = np.repeat(drum_mask[:, :, np.newaxis], 3, axis=2)
        
        # Apply rotation inside drum
        blended_drum = (rot_drum * drum_mask_3d + sub_drum * (1.0 - drum_mask_3d)).astype(np.uint8)
        f[cy-drum_r:cy+drum_r, cx-drum_r:cx+drum_r] = blended_drum
        
        # Engine body subtle throb
        x1, y1, x2, y2 = 425, 205, 475, 290
        sub_body = f[y1:y2, x1:x2].copy()
        M_vib = np.float32([[1, 0, vib_x], [0, 1, vib_y]])
        f[y1:y2, x1:x2] = cv2.warpAffine(sub_body, M_vib, (x2-x1, y2-y1), borderMode=cv2.BORDER_REPLICATE)
        
        # Drive wheel on right side rotation
        wx, wy = 548, 258
        wr = 18
        sub_wheel = f[wy-wr:wy+wr, wx-wr:wx+wr].copy()
        M_wrot = cv2.getRotationMatrix2D((wr, wr), -angle * 1.5, 1.0)
        rot_wheel = cv2.warpAffine(sub_wheel, M_wrot, (wr*2, wr*2), borderMode=cv2.BORDER_REFLECT)
        w_mask = np.zeros((wr*2, wr*2), dtype=np.float32)
        cv2.circle(w_mask, (wr, wr), wr - 1, 1.0, -1)
        w_mask_3d = np.repeat(w_mask[:, :, np.newaxis], 3, axis=2)
        f[wy-wr:wy+wr, wx-wr:wx+wr] = (rot_wheel * w_mask_3d + sub_wheel * (1.0 - w_mask_3d)).astype(np.uint8)

        mezc_frames.append(Image.fromarray(f))
        
    mezc_frames[0].save(os.path.join(out_dir, "anim_mezcladora_trompo.webp"), 
                        save_all=True, append_images=mezc_frames[1:], duration=FRAME_DURATION_MS, loop=0, quality=92)
    mezc_frames[0].save(os.path.join(out_dir, "anim_mezcladora_trompo.gif"), 
                        save_all=True, append_images=mezc_frames[1:], duration=FRAME_DURATION_MS, loop=0)
    print("anim_mezcladora_trompo saved.")

    # =========================================================================
    # 3. RETROEXCAVADORA SOBRE ORUGAS
    # Excavator: x in [630, 910], y in [15, 170]
    # Bucket in dirt: x ~ 650, y ~ 125
    # Exhaust pipe: x ~ 825, y ~ 65
    # =========================================================================
    print("Generating anim_retroexcavadora...")
    retro_frames = []
    
    for i in range(N_FRAMES):
        f = base_np.copy()
        t = i / N_FRAMES
        
        # Diesel engine rumble (sub-pixel vibration)
        eng_vib = 0.5 * math.sin(t * math.pi * 6)
        
        # Boom hydraulic articulation (1.5 px subtle digging pulse)
        boom_disp = 1.2 * math.sin(t * math.pi * 2)
        bx1, by1, bx2, by2 = 635, 20, 770, 155
        sub_boom = f[by1:by2, bx1:bx2].copy()
        M_boom = np.float32([[1, 0, 0], [0, 1, boom_disp]])
        f[by1:by2, bx1:bx2] = cv2.warpAffine(sub_boom, M_boom, (bx2-bx1, by2-by1), borderMode=cv2.BORDER_REPLICATE)
        
        # Exhaust plume from vertical stack at x=825, y=65
        ex_x, ex_y = 825, 65
        overlay = f.copy()
        for ep in range(12):
            progress = ((t + ep / 12.0) % 1.0)
            py = int(ex_y - progress * 40)
            px = int(ex_x + math.sin(progress * math.pi * 2) * 5 + progress * 8)
            rad = int(2 + progress * 7)
            alpha = (1.0 - progress) * 0.35
            # Translucent light grey diesel exhaust
            cv2.circle(overlay, (px, py), rad, (190, 190, 195), -1)
            
        mask = np.zeros((h, w), dtype=np.uint8)
        cv2.ellipse(mask, (ex_x, ex_y - 20), (35, 45), 0, 0, 360, 255, -1)
        mask = cv2.GaussianBlur(mask, (15, 15), 0)
        mask_3d = np.repeat(mask[:, :, np.newaxis] / 255.0, 3, axis=2)
        f = (overlay * mask_3d + f * (1.0 - mask_3d)).astype(np.uint8)
        retro_frames.append(Image.fromarray(f))
        
    retro_frames[0].save(os.path.join(out_dir, "anim_retroexcavadora.webp"), 
                         save_all=True, append_images=retro_frames[1:], duration=FRAME_DURATION_MS, loop=0, quality=92)
    retro_frames[0].save(os.path.join(out_dir, "anim_retroexcavadora.gif"), 
                         save_all=True, append_images=retro_frames[1:], duration=FRAME_DURATION_MS, loop=0)
    print("anim_retroexcavadora saved.")

    # =========================================================================
    # 4. VIBROCOMPACTADOR PATA DE CABRA
    # Roller: x in [1165, 1350], y in [120, 270]
    # Drum: x in [1180, 1345], y in [165, 265]
    # Beacon light on roof: x=1255, y=125
    # =========================================================================
    print("Generating anim_vibrocompactador...")
    vibro_frames = []
    
    for i in range(N_FRAMES):
        f = base_np.copy()
        t = i / N_FRAMES
        
        # High amplitude vertical centrifugal vibration (2.0 px)
        vib_y = 1.8 * math.sin(t * math.pi * 6)
        vib_x = 0.6 * math.cos(t * math.pi * 6)
        
        # Apply heavy vibration to roller drum and chassis
        rx1, ry1, rx2, ry2 = 1170, 140, 1350, 270
        sub_roller = f[ry1:ry2, rx1:rx2].copy()
        M_r = np.float32([[1, 0, vib_x], [0, 1, vib_y]])
        f[ry1:ry2, rx1:rx2] = cv2.warpAffine(sub_roller, M_r, (rx2-rx1, ry2-ry1), borderMode=cv2.BORDER_REPLICATE)
        
        # Amber warning strobe on roof (x=1252, y=125)
        beacon_x, beacon_y = 1252, 125
        strobe_phase = (t * 2.0) % 1.0 # 2 flashes per cycle
        if strobe_phase < 0.35:
            intensity = math.sin((strobe_phase / 0.35) * math.pi)
            glow_rad = int(8 + intensity * 14)
            overlay = f.copy()
            # Golden amber flash
            cv2.circle(overlay, (beacon_x, beacon_y), glow_rad, (0, 180, 255), -1)
            cv2.circle(overlay, (beacon_x, beacon_y), int(glow_rad * 0.5), (100, 220, 255), -1)
            cv2.circle(overlay, (beacon_x, beacon_y), 3, (255, 255, 255), -1)
            mask = np.zeros((h, w), dtype=np.uint8)
            cv2.circle(mask, (beacon_x, beacon_y), glow_rad + 10, 255, -1)
            mask = cv2.GaussianBlur(mask, (11, 11), 0)
            mask_3d = np.repeat(mask[:, :, np.newaxis] / 255.0, 3, axis=2)
            f = (overlay * mask_3d + f * (1.0 - mask_3d)).astype(np.uint8)
            
        vibro_frames.append(Image.fromarray(f))
        
    vibro_frames[0].save(os.path.join(out_dir, "anim_vibrocompactador.webp"), 
                         save_all=True, append_images=vibro_frames[1:], duration=FRAME_DURATION_MS, loop=0, quality=92)
    vibro_frames[0].save(os.path.join(out_dir, "anim_vibrocompactador.gif"), 
                         save_all=True, append_images=vibro_frames[1:], duration=FRAME_DURATION_MS, loop=0)
    print("anim_vibrocompactador saved.")

    # =========================================================================
    # 5. MARTILLO NEUMÁTICO ROMPEPAVIMENTOS
    # Worker: x in [1100, 1345], y in [460, 690]
    # Chisel impact tip: x=1173, y=650
    # =========================================================================
    print("Generating anim_martillo_neumatico...")
    mart_frames = []
    
    for i in range(N_FRAMES):
        f = base_np.copy()
        t = i / N_FRAMES
        
        # High impact percussive stroke at 25 Hz (sharp downward strike, elastic recoil)
        cycle = (t * 4.0) % 1.0
        if cycle < 0.3:
            impact_disp = -2.5 * math.sin((cycle / 0.3) * math.pi)
        else:
            impact_disp = 1.0 * math.sin(((cycle - 0.3) / 0.7) * math.pi)
            
        # Jitter worker and hammer
        hx1, hy1, hx2, hy2 = 1110, 460, 1260, 675
        sub_mart = f[hy1:hy2, hx1:hx2].copy()
        M_h = np.float32([[1, 0, 0], [0, 1, impact_disp]])
        f[hy1:hy2, hx1:hx2] = cv2.warpAffine(sub_mart, M_h, (hx2-hx1, hy2-hy1), borderMode=cv2.BORDER_REPLICATE)
        
        # Compressor engine pulse
        cx1, cy1, cx2, cy2 = 1270, 520, 1345, 665
        comp_disp = 0.8 * math.sin(t * math.pi * 8)
        sub_comp = f[cy1:cy2, cx1:cx2].copy()
        M_c = np.float32([[1, 0, 0], [0, 1, comp_disp]])
        f[cy1:cy2, cx1:cx2] = cv2.warpAffine(sub_comp, M_c, (cx2-cx1, cy2-cy1), borderMode=cv2.BORDER_REPLICATE)
        
        # Concrete dust and chips burst at chisel tip (x=1173, y=650)
        tip_x, tip_y = 1173, int(650 + impact_disp)
        overlay = f.copy()
        
        if cycle < 0.45:
            burst_intensity = math.sin((cycle / 0.45) * math.pi)
            for p in range(25):
                dist = random.uniform(4, 38) * burst_intensity
                angle = random.uniform(math.pi * 0.7, math.pi * 2.3) # spray upwards and outwards
                px = int(tip_x + dist * math.cos(angle))
                py = int(tip_y + dist * math.sin(angle) * 0.5) # flattened on slab
                rad = int(1.5 + random.uniform(0.5, 3.0))
                # Chalky concrete white/grey particles
                color = (int(220 + random.randint(-15, 25)), 
                         int(220 + random.randint(-15, 25)), 
                         int(215 + random.randint(-15, 25)))
                cv2.circle(overlay, (px, py), rad, color, -1)
                
            # Direct impact flash
            cv2.circle(overlay, (tip_x, tip_y), 5, (255, 255, 240), -1)
            # Mask strictly around chisel zone
            mask = np.zeros((h, w), dtype=np.uint8)
            cv2.circle(mask, (tip_x, tip_y), 55, 255, -1)
            mask = cv2.GaussianBlur(mask, (15, 15), 0)
            mask_3d = np.repeat(mask[:, :, np.newaxis] / 255.0, 3, axis=2)
            f = (overlay * mask_3d + f * (1.0 - mask_3d)).astype(np.uint8)
            
        mart_frames.append(Image.fromarray(f))
        
    mart_frames[0].save(os.path.join(out_dir, "anim_martillo_neumatico.webp"), 
                        save_all=True, append_images=mart_frames[1:], duration=FRAME_DURATION_MS, loop=0, quality=92)
    mart_frames[0].save(os.path.join(out_dir, "anim_martillo_neumatico.gif"), 
                        save_all=True, append_images=mart_frames[1:], duration=FRAME_DURATION_MS, loop=0)
    print("anim_martillo_neumatico saved.")

    print("\nALL SECTOR A ASSETS GENERATED SUCCESSFULLY WITH ZERO OVERLAP!")

if __name__ == '__main__':
    build_assets()
