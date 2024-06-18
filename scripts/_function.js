import { system, Block, ItemStack, EntityEquippableComponent, EquipmentSlot, ItemDurabilityComponent, ItemComponentTypes, ItemEnchantableComponent, world } from "@minecraft/server"
export const blockRayCast = { includeLiquidBlocks: true, includePassableBlocks: false, maxDistance: 9 }
export const DEBUG = false
export const equipmentSlots = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet, EquipmentSlot.Offhand]
export let inventories = []

/** @param {ItemStack} item1  @param {ItemStack} item2 @returns {Boolean} */
export function isMatches(item1, item2, hardCheck = true) {
    if (item1.typeId !== item2.typeId) return false
    if (item1.nameTag !== item2.nameTag) return false
    const du1 = item1.getComponent(ItemComponentTypes.Durability)
    const du2 = item2.getComponent(ItemComponentTypes.Durability)
    const lore1 = item1.getLore()
    const lore2 = item2.getLore()

    if (du1 && du2) if (du1.damage !== du2.damage) return false
    else if (du1 || du2) return false
    if (item1.keepOnDeath !== item2.keepOnDeath) return false
    if (lore1.length !== lore2.length) return false
    if (hardCheck) {
        const enchant1 = item1?.getComponent(ItemComponentTypes.Enchantments)?.enchantments || []
        const enchant2 = item2?.getComponent(ItemComponentTypes.Enchantments)?.enchantments || []
        if (enchant1.length !== enchant2.length) return false
        for (let i = 0; i < enchant1.length; i++) if (enchant1[i].type.id !== enchant2[i].type.id || enchant1[i].level !== enchant2[i].level) return false;
        for (let i = 0; i < lore1.length; i++) if (lore1[i] !== lore2[i]) return false
    }
    return true
}

export function newInv(con, equ_ = false) {
    let items = []
    if (!equ_) {
        for (let i = 0; i < 36; i++) {
            const item = con.getItem(i)
            if (item) {
                const durability = item.getComponent("durability") ? item.getComponent("durability").damage : 0
                items.push({ typeId: item.typeId, amount: item.amount, durability, slot: i })
            }
        }
    } else {
        for (const slot of equipmentSlots) {
            const item_ = con.getEquipment(slot)
            const type_ = item_ ? item_.typeId : ''
            const durability_ = item_ ? (item_.getComponent("durability") ? item_.getComponent("durability").damage : 0) : 0
            items.push({ typeId: type_, durability: durability_, slot })
        }
    }
    return items
}

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