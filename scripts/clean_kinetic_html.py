import sys, re

with open('simulador_higiene_ruido_multisectorial.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the talking-head-anchor to only have speech-emission-halo radiating from microphone
old_talking_block = """                    <!-- ANIMACIÓN DE TELEOPERADORA HABLANDO EN TIEMPO REAL -->
                    <div class="talking-head-anchor" style="position:absolute; left:63.5%; top:42%; transform:translate(-50%, -50%); z-index:15;">
                        <!-- Labios animados articulando palabras -->
                        <div class="animated-mouth-box">
                            <svg class="talking-mouth-svg" viewBox="0 0 50 32" style="width:32px; height:20px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
                                <ellipse cx="25" cy="16" rx="16" ry="8" fill="#450a0a" class="mouth-cavity"/>
                                <rect x="15" y="11" width="20" height="3" rx="1.5" fill="#ffffff" class="upper-teeth"/>
                                <path d="M 6 16 Q 25 8 44 16 Q 25 12 6 16 Z" fill="#b91c1c" class="upper-lip"/>
                                <path d="M 6 16 Q 25 24 44 16 Q 25 19 6 16 Z" fill="#991b1b" class="lower-lip"/>
                            </svg>
                        </div>
                        <!-- Ondas vocales humanas radiando del micrófono -->
                        <div class="speech-emission-halo">
                            <div class="speech-wave wave-1"></div>
                            <div class="speech-wave wave-2"></div>
                            <div class="speech-wave wave-3"></div>
                        </div>
                    </div>"""

# Check if old_talking_block or with encoding exists
pattern = r'<!-- ANIMACI[ÓO\?]N DE TELEOPERADORA HABLANDO EN TIEMPO REAL -->.*?</div>\s*</div>'
new_talking_block = """<!-- RADIACIÓN ACÚSTICA DE VOZ Y DIADEMA TELEFÓNICA -->
                    <div class="talking-head-anchor" style="position:absolute; left:54%; top:52%; transform:translate(-50%, -50%); z-index:15; pointer-events:none;">
                        <!-- Ondas vocales humanas radiando del micrófono -->
                        <div class="speech-emission-halo">
                            <div class="speech-wave wave-1"></div>
                            <div class="speech-wave wave-2"></div>
                            <div class="speech-wave wave-3"></div>
                        </div>
                    </div>"""

content = re.sub(pattern, new_talking_block, content, count=1, flags=re.DOTALL)

with open('simulador_higiene_ruido_multisectorial.html', 'w', encoding='utf-8') as f:
    f.write(content)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned up mouth overlay from HTML and index.html!")
