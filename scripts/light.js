import { ItemStack, world, system, EntityEquippableComponent, EquipmentSlot, BlockPermutation, BlockStates, Block } from "@minecraft/server"
// https://minecraft.wiki/w/Light#Light-emitting_blocks

const DELAY = 0
const DECAY_LIGHT_TICK = 3
const REDUCE_LIGHT = 0.8 /** 0.7 is kinda best! */

const light = {
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

system.runInterval(() => {
    world.getDynamicPropertyIds().forEach(dy => {
        try {
            let time = world.getDynamicProperty(dy)
            let arr = dy.split(":")
            let dim = arr[1]
            let x = Number(arr[2])
            let y = Number(arr[3])
            let z = Number(arr[4])
            let level = Number(arr[5])
            let liq = arr[6] === 'true'

            if (time < 0) {
                let block = world.getDimension(dim).getBlock({ x: Number(x), y: Number(y), z: Number(z) })
                let lig = block.permutation.getState("block_light_level")
                if (lig <= 0) {
                    world.setDynamicProperty(dy, undefined)
                    let block = world.getDimension(dim).getBlock({ x: Number(x), y: Number(y), z: Number(z) })
                    let air = BlockPermutation.resolve('minecraft:air')
                    if (liq) air = BlockPermutation.resolve('minecraft:water')
                    block.setPermutation(air)
                    return
                }
                let state = BlockPermutation.resolve('minecraft:light_block').withState('block_light_level', Number(lig - 1))
                block.setPermutation(state)
                world.setDynamicProperty(dy, time - 1)
                return
            }

            let state = BlockPermutation.resolve('minecraft:light_block').withState('block_light_level', Number(level))
            world.getDimension(dim).getBlock({ x: Number(x), y: Number(y), z: Number(z) }).setPermutation(state)
            world.setDynamicProperty(dy, time - 1)
        } catch (e) {
            world.setDynamicProperty(dy, undefined)
        }
    })

    let itemArray = world.getDimension('overworld').getEntities({ type: "minecraft:item" })
    itemArray.forEach(en => {
        let item = en.getComponent("item").itemStack

        const typeId = item.typeId.split('minecraft:')[1].toLocaleLowerCase()
        const type = light[typeId]
        if (!type || typeof type.light !== 'number') return
        let lightLevel = Math.min(15, Math.ceil(type.light * REDUCE_LIGHT))
        let inLiquid = type.inLiquid || false
        let block = en.dimension.getBlock(en.location)
        let directions = ['east', 'west', 'north', 'south', '']

        for (let direction of directions) {
            /** @type {Block} */
            if (inLiquid) {
                let blo = block
                if (direction !== '') blo = block[direction](-1)
                if (blo.isLiquid) put(blo, lightLevel)
                if (blo.permutation.matches("minecraft:light_block")) put(blo, lightLevel)

                let blo2 = blo.offset({ x: 0, y: 1, z: 0 })
                if (blo2.isLiquid) put(blo2, lightLevel)
                if (blo2.permutation.matches("minecraft:light_block")) put(blo2, lightLevel)
                let blo3 = blo2.offset({ x: 0, y: 1, z: 0 })
                if (blo3.isLiquid) put(blo3, lightLevel)
                if (blo3.permutation.matches("minecraft:light_block")) put(blo3, lightLevel)
            } else {
                let blo = block
                if (direction !== '') blo = block[direction](-1)
                if (blo.isLiquid || blo.isAir) put(blo, lightLevel)
                if (blo.permutation.matches("minecraft:light_block")) put(blo, lightLevel)

                let blo2 = blo.offset({ x: 0, y: 1, z: 0 })
                if (blo2.isLiquid || blo2.isAir) put(blo2, lightLevel)
                if (blo2.permutation.matches("minecraft:light_block")) put(blo2, lightLevel)
                let blo3 = blo2.offset({ x: 0, y: 1, z: 0 })
                if (blo3.isLiquid || blo3.isAir) put(blo3, lightLevel)
                if (blo3.permutation.matches("minecraft:light_block")) put(blo3, lightLevel)
            }
        }
    })

    const obj = world.getAllPlayers()
    obj.forEach(pl => {
        const equippable = pl.getComponent("equippable")
        /** @type {ItemStack} */
        const item = equippable?.getEquipment(EquipmentSlot.Mainhand)
        if (!item) return
        /** @type {string} */
        const typeId = item.typeId.split('minecraft:')[1].toLocaleLowerCase()
        const type = light[typeId]
        if (!type || typeof type.light !== 'number') return
        let lightLevel = Math.max(0, Math.min(15, Math.ceil(type.light * REDUCE_LIGHT)))
        let inLiquid = type.inLiquid || false
        let block = pl.dimension.getBlock(pl.location)
        let directions = ['east', 'west', 'north', 'south', '']

        for (let direction of directions) {
            /** @type {Block} */
            if (inLiquid) {
                let blo = block
                if (direction !== '') blo = block[direction](-1)
                if (blo.isLiquid) put(blo, lightLevel)
                if (blo.permutation.matches("minecraft:light_block")) put(blo, lightLevel)

                let blo2 = blo.offset({ x: 0, y: 1, z: 0 })
                if (blo2.isLiquid) put(blo2, lightLevel)
                if (blo2.permutation.matches("minecraft:light_block")) put(blo2, lightLevel)
                let blo3 = blo2.offset({ x: 0, y: 1, z: 0 })
                if (blo3.isLiquid) put(blo3, lightLevel)
                if (blo3.permutation.matches("minecraft:light_block")) put(blo3, lightLevel)
            } else {
                let blo = block
                if (direction !== '') blo = block[direction](-1)
                if (blo.isLiquid || blo.isAir) put(blo, lightLevel)
                if (blo.permutation.matches("minecraft:light_block")) put(blo, lightLevel)

                let blo2 = blo.offset({ x: 0, y: 1, z: 0 })
                if (blo2.isLiquid || blo2.isAir) put(blo2, lightLevel)
                if (blo2.permutation.matches("minecraft:light_block")) put(blo2, lightLevel)
                let blo3 = blo2.offset({ x: 0, y: 1, z: 0 })
                if (blo3.isLiquid || blo3.isAir) put(blo3, lightLevel)
                if (blo3.permutation.matches("minecraft:light_block")) put(blo3, lightLevel)
            }
        }
    })
}, DELAY)

/** @param {Block} block @param {Number} level */
function put(block, level) {
    let set = `light:${block.dimension.id.split(":")[1]}:${block.location.x}:${block.location.y}:${block.location.z}:${level}:${block.permutation.matches("minecraft:water")}`
    if (!world.getDynamicProperty(set) && block.permutation.matches("minecraft:light_block")) return
    if (block.isLiquid) if (block.permutation.getState('liquid_depth') !== 0) return
    let state = BlockPermutation.resolve('minecraft:light_block').withState('block_light_level', Number(level))
    world.getDimension(block.dimension.id).getBlock(block.location).setPermutation(state)

    if (!world.getDynamicProperty(set)) world.setDynamicProperty(set, DECAY_LIGHT_TICK)
}