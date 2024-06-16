import { system, Block, ItemStack } from "@minecraft/server"
export const blockRayCast = { includeLiquidBlocks: true, includePassableBlocks: false, maxDistance: 9 }
export const DEBUG = false

/** @returns {String} */
export function getBlock(block, isPermutation = false) { return isPermutation ? block.getItemStack(1).typeId : block.permutation.getItemStack(1).typeId }
/** @returns {String} */
export function reName(item) { return item.split(":")[1].split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ") }
/** @returns {Promise} */
export function wait(ticks) { return new Promise((resolve) => { system.runTimeout(resolve, ticks) }) }
/** @returns {Boolean} */
export function check(a, b) { a.length === b.length && a.every(x => b.some(y => JSON.stringify(x) === JSON.stringify(y))) }
/** @param {Block} block @returns {Boolean}  */
export function isFrame(block) { return block.permutation.matches('minecraft:frame') || block.permutation.matches('minecraft:glow_frame') }
/** @returns {Number} */
export function calDis(entity, entity_, floor = true) { const dis = Math.sqrt(Math.pow(entity.location.x - entity_.location.x, 2) + Math.pow(entity.location.y - entity_.location.y, 2) + Math.pow(entity.location.z - entity_.location.z, 2)); return floor ? dis.toFixed(0) : dis }

function subV(v1, v2) { return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z, } }
function norV(v) {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
    if (length === 0) return { x: 0, y: 0, z: 0 }
    return { x: v.x / length, y: v.y / length, z: v.z / length, }
}
/**@param {Entity} entity @returns {Array.<Entity>}*/
export function geViewEntity(entity, typeId = 'minecraft:item') {
    const viewEn = []
    const vd = norV(entity.getViewDirection())
    const en = entity.dimension.getEntities({ type: typeId })
    const loc = entity.location
    const vdX = vd.x, vdY = vd.y, vdZ = vd.z

    for (const entity of en) {
        const toEnt = subV(entity.location, loc)
        const norm = norV(toEnt)
        const dot = vdX * norm.x + vdY * norm.y + vdZ * norm.z
        if (dot > 0.4) viewEn.push(entity)
    }

    return viewEn
}
export function rayCastPos(loc, loc2) {
    const dx = loc2.x - loc.x, dy = loc2.y - loc.y, dz = loc2.z - loc.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const x = dx / distance, y = dy / distance, z = dz / distance

    return { x: x, y: y, z: z }
}

export const AFTER_BREAK = new ItemStack('minecraft:air', 1)
export const light = {
    "beacon": { light: 15 },
    "campfire": { light: 15 },
    "conduit": { light: 15 },
    "ochre_froglight": { light: 15 },
    "pearlescent_froglight": { light: 15 },
    "verdant_froglight": { light: 15 },
    "glowstone": { light: 15 },
    "lit_pumpkin": { light: 15 },
    "lantern": { light: 15 },
    "lava_bucket": { light: 15 },
    "sea_lantern": { light: 15 },
    "shroomlight": { light: 15 },
    "end_rod": { light: 14 },
    "glow_berries": { light: 14 },
    "torch": { light: 14 },
    "crying_obsidian": { light: 10 },
    "soul_campfire": { light: 10 },
    "soul_lantern": { light: 10 },
    "soul_torch": { light: 10 },
    "enchanting_table": { light: 7 },
    "ender_chest": { light: 7 },
    "glow_lichen": { light: 7 },
    "redstone_torch": { light: 7 },
    "sculk_catalyst": { light: 6 },
    "sea_pickle": { light: 6, inLiquid: true },
    "vault": { light: 6 },
    "amethyst_cluster": { light: 5 },
    "large_amethyst_bud": { light: 4 },
    "trial_spawner": { light: 4 },
    "magma": { light: 3 },
    "medium_amethyst_bud": { light: 2 },
    "brewing_stand": { light: 1 },
    "brown_mushroom": { light: 1 },
    "calibrated_sculk_sensor": { light: 1 },
    "dragon_egg": { light: 1 },
    "end_portal_frame": { light: 1 },
    "sculk_sensor": { light: 1 },
    "small_amethyst_bud": { light: 1 }
}