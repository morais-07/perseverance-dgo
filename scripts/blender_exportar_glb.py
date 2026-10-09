# Exporta o rover do Blender para public/models/perseverance_dgo.glb com os nomes que o site reconhece.
# Uso (não altera o .blend):
#   "C:\Program Files\Blender Foundation\Blender 4.4\blender.exe" -b Rover_E4_DGO.blend ^
#       --python scripts/blender_exportar_glb.py -- public/models/perseverance_dgo.glb
#
# O que faz: tira a câmara e a luz, passa os componentes de topo para nós de topo com os nomes
# mastro / braco / suspensao / chassis_* / mmrtg / antena, corrige materiais não metálicos
# (o Fusion exporta tudo com metallic = 1) e exporta GLB com compressão Draco.
# Se os nomes dos componentes no Fusion mudarem, ajustar a lista MAP abaixo.
import bpy, sys
out = sys.argv[sys.argv.index('--')+1]

# 1) Fora câmara e luz do Blender
for o in list(bpy.data.objects):
    if o.type in {'CAMERA', 'LIGHT'}:
        bpy.data.objects.remove(o, do_unlink=True)

# 2) Componentes de topo -> nós de topo com os nomes que o site reconhece
root = next(o for o in bpy.data.objects if o.parent is None and o.name.startswith('Assembly_Perseverance'))
MAP = [  # (prefixo do nome no Fusion, nome no site)
    ('Assemble da suspensa', 'suspensao'),
    ('Braço Perseverance', 'braco'),
    ('Braço_Camara', 'mastro'),
    ('Chassis_Base', 'chassis_base'),
    ('box', 'chassis_caixa'),
    ('Grid_chassis_rtg', 'chassis_grelha'),
    ('Reator', 'mmrtg'),
    ('HFA', 'antena'),
]
for ch in list(root.children):
    mw = ch.matrix_world.copy()
    ch.parent = None
    ch.matrix_world = mw
    for pref, new in MAP:
        if ch.name.startswith(pref):
            print('MAP', ch.name, '->', new)
            ch.name = new
            break
    else:
        print('SEM MAPEAMENTO', ch.name)
bpy.data.objects.remove(root, do_unlink=True)

# 3) Materiais: o Fusion exporta tudo como metal=1; corrigir os não metálicos
def setm(name_part, metal=None, rough=None, color=None, alpha=None):
    for m in bpy.data.materials:
        if name_part in m.name and m.use_nodes:
            b = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
            if not b: continue
            if metal is not None: b.inputs['Metallic'].default_value = metal
            if rough is not None: b.inputs['Roughness'].default_value = rough
            if color is not None: b.inputs['Base Color'].default_value = color
            if alpha is not None:
                b.inputs['Alpha'].default_value = alpha
                m.blend_method = 'BLEND'
setm('Glass', metal=0.0, rough=0.08, color=(0.55, 0.68, 0.8, 1), alpha=0.45)
setm('Nylon', metal=0.0, rough=0.6)
setm('Powder Coat', metal=0.0, rough=0.6)
setm('Aluminum - Satin', rough=0.42)
setm('Aluminum - Brushed', rough=0.38)
setm('Aluminum - Anodized', rough=0.45)
setm('Steel', rough=0.38)
setm('Titanium', rough=0.4)

# 4) Exportar GLB
bpy.ops.export_scene.gltf(
    filepath=out, export_format='GLB', export_yup=True, export_apply=True,
    export_cameras=False, export_lights=False, export_materials='EXPORT',
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
    export_draco_position_quantization=14, export_draco_normal_quantization=10,
)
print('EXPORTADO', out)
