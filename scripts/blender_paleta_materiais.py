# Aplica a paleta de materiais DGO a uma CÓPIA do rover (não altera o ficheiro original).
# Uso:
#   "C:\Program Files\Blender Foundation\Blender 4.4\blender.exe" -b Rover_E4_DGO.blend ^
#       --python scripts/blender_paleta_materiais.py -- Rover_E4_DGO_materiais.blend
# Para mudar uma cor, editem os valores (R, G, B), metallic e roughness das linhas mat(...) abaixo,
# ou abram a cópia no Blender e ajustem os materiais DGO_* no separador Shading.
import bpy, sys
out = sys.argv[sys.argv.index('--')+1]

def mat(name, color, metal, rough):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rough
    return m

BRANCO   = mat('DGO_Branco_Pintado',  (0.80, 0.80, 0.78), 0.0, 0.42)   # corpo e mastro
ALU      = mat('DGO_Aluminio',        (0.72, 0.73, 0.75), 1.0, 0.30)   # peças metálicas claras
CINZA    = mat('DGO_Cinza_Escuro',    (0.11, 0.11, 0.12), 0.9, 0.42)   # braço
PRETO    = mat('DGO_Preto_Fosco',     (0.035, 0.035, 0.04), 0.0, 0.60) # sensores, torre
ACO      = mat('DGO_Aco',             (0.28, 0.29, 0.31), 1.0, 0.38)
TITANIO  = mat('DGO_Titanio',         (0.17, 0.17, 0.19), 1.0, 0.42)   # tubos da suspensão
RODA     = mat('DGO_Roda',            (0.18, 0.18, 0.20), 0.9, 0.42)   # rodas
BORRACHA = mat('DGO_Borracha',        (0.03, 0.03, 0.03), 0.0, 0.85)
RTG      = mat('DGO_RTG',             (0.85, 0.85, 0.83), 0.5, 0.35)
ANTENA   = mat('DGO_Antena',          (0.90, 0.90, 0.88), 0.0, 0.50)

# (prefixo do componente do Fusion, material original) -> novo material
RULES = {
  'Chassis_Base':      {'*': BRANCO},
  'Grid_chassis_rtg':  {'*': ALU},
  'box':               {'*': ALU},
  'Braço_Camara':      {'Aluminum - Brushed Linear': BRANCO, 'Powder Coat - Rough (Dark Grey)': PRETO, 'Steel': ACO},
  'Braço Perseverance':{'Powder Coat - Rough (Dark Grey)': PRETO, 'Aluminum - Anodized': CINZA, 'Steel': ACO},
  'Assemble da suspensa': {'Aluminum - Satin': RODA, 'Titanium': TITANIO, 'Steel': ACO, 'Aluminum - Anodized': CINZA, 'Nylon': BORRACHA},
  'Reator':            {'*': RTG},
  'HFA':               {'*': ANTENA},
}
tops = [c for r in bpy.data.objects if r.parent is None and r.type == 'EMPTY' for c in r.children]
changed = 0
for t in tops:
    rule = next((v for k, v in RULES.items() if t.name.startswith(k)), None)
    if not rule: print('SEM REGRA', t.name); continue
    for o in [t] + list(t.children_recursive):
        if o.type != 'MESH': continue
        for slot in o.material_slots:
            if not slot.material: continue
            old = slot.material.name
            new = rule.get('*') or next((v for k, v in rule.items() if k != '*' and old.startswith(k)), None)
            if new and slot.material != new:
                slot.material = new; changed += 1
print('SLOTS ALTERADOS', changed)
bpy.ops.wm.save_as_mainfile(filepath=out)
print('GUARDADO', out)
