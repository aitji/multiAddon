import {
    world, system, Block,

    EquipmentSlot,
    Player, Entity,
    BlockPermutation
} from "@minecraft/server"

const DELAY = 0
const DECAY_LIGHT_TICK = 3
const REDUCE_LIGHT = 0.8

const lightLevels = {
    "beacon": 15, "campfire": 15, "conduit": 15, "ochre_froglight": 15, "pearlescent_froglight": 15, "verdant_froglight": 15,
    "glowstone": 15, "lit_pumpkin": 15, "lantern": 15, "lava_bucket": 15, "sea_lantern": 15, "shroomlight": 15, "end_rod": 14,
    "glow_berries": 14, "torch": 14, "crying_obsidian": 10, "soul_campfire": 10, "soul_lantern": 10, "soul_torch": 10,
    "enchanting_table": 7, "ender_chest": 7, "glow_lichen": 7, "redstone_torch": 7, "sculk_catalyst": 6, "sea_pickle": 6,
    "vault": 6, "amethyst_cluster": 5, "large_amethyst_bud": 4, "trial_spawner": 4, "magma": 3, "medium_amethyst_bud": 2,
    "brewing_stand": 1, "brown_mushroom": 1, "calibrated_sculk_sensor": 1, "dragon_egg": 1, "end_portal_frame": 1,
    "sculk_sensor": 1, "small_amethyst_bud": 1
}

system.runInterval(() => {
    world.getDynamicPropertyIds().forEach(id => {
        try {
            let [_, dim, x, y, z, level, inLiquid] = id.split(":")
            let time = world.getDynamicProperty(id)
            let block = world.getDimension(dim).getBlock({ x: +x, y: +y, z: +z })

            if (time < 0) {
                handleDecay(block, id, inLiquid === 'true')
            } else {
                block.setPermutation(BlockPermutation.resolve('minecraft:light_block').withState('block_light_level', +level))
                world.setDynamicProperty(id, time - 1)
            }
        } catch(e) {
            console.log(e)
            world.setDynamicProperty(id, undefined)
        }
    })

    handleEntities(world.getDimension('overworld').getEntities({ type: "minecraft:item" }))
    handlePlayers(world.getAllPlayers())
}, DELAY)

function handleDecay(block, id, inLiquid) {
    let lightLevel = block.permutation.getState("block_light_level")
    if (lightLevel <= 0) {
        world.setDynamicProperty(id, undefined)
        block.setPermutation(BlockPermutation.resolve(inLiquid ? 'minecraft:water' : 'minecraft:air'))
    } else {
        block.setPermutation(BlockPermutation.resolve('minecraft:light_block').withState('block_light_level', lightLevel - 1))
        world.setDynamicProperty(id, world.getDynamicProperty(id) - 1)
    }
}

/** @param {Entity} entities */
function handleEntities(entities) {
    entities.forEach(entity => {
        let item = entity.getComponent("item").itemStack
        let lightLevel = getLightLevel(item.typeId.split('minecraft:')[1])
        if (lightLevel) applyLight(entity.dimension.getBlock(entity.location), lightLevel, lightLevels[item.typeId.split('minecraft:')[1]].inLiquid)
    })
}

/** @param {Array[Player]} players */
function handlePlayers(players) {
    players.forEach(player => {
        let item = player.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand)
        if (item) {
            let lightLevel = getLightLevel(item.typeId.split('minecraft:')[1])
            if (lightLevel) applyLight(player.dimension.getBlock(player.location), lightLevel, lightLevels[item.typeId.split('minecraft:')[1]].inLiquid)
        }
    })
}

/** @param {String} typeId @returns {Number|null} */
function getLightLevel(typeId) {
    let light = lightLevels[typeId]
    return light ? Math.min(15, Math.ceil(light * REDUCE_LIGHT)) : null
}

/** @param {Block} block @param {Number} lightLevel @param {Boolean} inLiquid  */
function applyLight(block, lightLevel, inLiquid) {
    let directions = ['east', 'west', 'north', 'south', '']
    directions.forEach(direction => {
        let blo = block
        if (direction) blo = block[direction](-1)

        if (inLiquid) {
            if (blo.isLiquid || blo.permutation.matches("minecraft:light_block")) put(blo, lightLevel)
            let blo2 = blo.offset({ x: 0, y: 1, z: 0 })
            if (blo2.isLiquid || blo2.permutation.matches("minecraft:light_block")) put(blo2, lightLevel)
            let blo3 = blo2.offset({ x: 0, y: 1, z: 0 })
            if (blo3.isLiquid || blo3.permutation.matches("minecraft:light_block")) put(blo3, lightLevel)
        } else {
            if (blo.isLiquid || blo.isAir || blo.permutation.matches("minecraft:light_block")) put(blo, lightLevel)
            let blo2 = blo.offset({ x: 0, y: 1, z: 0 })
            if (blo2.isLiquid || blo2.isAir || blo2.permutation.matches("minecraft:light_block")) put(blo2, lightLevel)
            let blo3 = blo2.offset({ x: 0, y: 1, z: 0 })
            if (blo3.isLiquid || blo3.isAir || blo3.permutation.matches("minecraft:light_block")) put(blo3, lightLevel)
        }
    })
}

/** @param {Block} block @param {Number} level */
function put(block, level) {
    if (block.isLiquid && block.permutation.getState('liquid_depth') !== 0) return

    let id = `light:${block.dimension.id.split(":")[1]}:${block.location.x}:${block.location.y}:${block.location.z}:${level}:${block.permutation.matches("minecraft:water")}`
    if (world.getDynamicProperty(id)) return

    block.setPermutation(BlockPermutation.resolve('minecraft:light_block').withState('block_light_level', level))
    world.setDynamicProperty(id, DECAY_LIGHT_TICK)
}