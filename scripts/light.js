import { ItemStack, world, system, EntityEquippableComponent, EquipmentSlot, BlockPermutation, BlockStates, Block, Player, MinecraftDimensionTypes, GameMode } from "@minecraft/server"
import { DEBUG, isFrame, light } from "./_function"
// https://minecraft.wiki/w/Light#Light-emitting_blocks

const DELAY = 0 /** delay for everything (0 is good) */
const DECAY_LIGHT_TICK = 3 /** before light when off time (delay*decay) | (3) */
const REDUCE_LIGHT = 0.8 /** lightLevel * REDUCE_LIGHT | (0.8) */
const ENTITY_RENDER_DISTANT_BLOCK = 32 /** block that entity load from player (32) */

if (DEBUG) world.sendMessage(`§c* WARNING, you're enable debug mode please disable before publish!`)

/** @param {Player} en */
const processEntity = (en, isPlayer = false) => {
    try {
        if (isPlayer) {
            en.dimension.getEntities({
                maxDistance: ENTITY_RENDER_DISTANT_BLOCK || 64,
                location: en.location,
                type: 'minecraft:item'
            }).forEach(enr => processEntity(enr))
        }

        let mItem = isPlayer ? en.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand) : en.getComponent("item")?.itemStack
        let oItem = isPlayer ? en.getComponent("equippable")?.getEquipment(EquipmentSlot.Offhand) : undefined

        let mTypeId = mItem?.typeId?.split(':')[1]?.toLowerCase()
        let mType = mTypeId ? light[mTypeId] : undefined
        let mLight = mType?.light || 0;

        let oTypeId = oItem?.typeId?.split(':')[1]?.toLowerCase()
        let oType = oTypeId ? light[oTypeId] : undefined
        let oLight = oType?.light || 0

        let LL = Math.min(15, Math.ceil((mLight + oLight) * REDUCE_LIGHT))
        let block = en.dimension.getBlock(en.location)
        let direct = ['east', 'west', 'north', 'south', '']

        direct.forEach(dir => {
            let blo = dir ? block[dir](-1) : block
            let checkAndPut = blo => { if (blo.isLiquid || blo.isAir || blo.permutation.matches("minecraft:light_block")) put_light(blo, LL, en) }
            for (let i = 0; i < 3; i++) checkAndPut(blo); blo = blo.offset({ x: 0, y: 1, z: 0 })
        })
    } catch (error) { if (DEBUG) world.sendMessage(`${error}`) }
}

system.runInterval(() => {
    world.getAllPlayers().forEach(pl => processEntity(pl, true))
    world.getDynamicPropertyIds().forEach(dy => {
        if (dy.startsWith("chuck_unload:")) {
            let time = world.getDynamicProperty(dy)
            let arr = dy.split(":")
            let [_, _2, dim, x, y, z, level, liq] = arr
            liq = (liq === 'true')

            const block = world.getDimension(dim).getBlock({ x: Number(x), y: Number(y), z: Number(z) })
            try {
                if (block.isAir || (liq && block.isLiquid) || block.permutation.matches('minecraft:light_block')) {
                    world.setDynamicProperty(dy, undefined)
                    let resole = BlockPermutation.resolve('minecraft:air')
                    if (liq) BlockPermutation.resolve('minecraft:water')

                    block.setPermutation(resole)
                    put_light(block, level, Infinity)
                }
            } catch (e) { }
        } else if (dy.startsWith("light:")) {
            let time = world.getDynamicProperty(dy)
            let arr = dy.split(":")
            let [_, dim, x, y, z, level, liq] = arr
            liq = (liq === 'true')

            const block = world.getDimension(dim).getBlock({ x: Number(x), y: Number(y), z: Number(z) })
            const normal_light = BlockPermutation.resolve('minecraft:light_block').withState('block_light_level', Number(level))

            try {
                if (time < 0) {
                    const lig = block.permutation.getState("block_light_level")
                    if (lig <= 0) {
                        world.setDynamicProperty(dy, undefined)
                        let block = world.getDimension(dim).getBlock({ x: Number(x), y: Number(y), z: Number(z) })
                        let air = BlockPermutation.resolve('minecraft:air')
                        if (liq) air = BlockPermutation.resolve('minecraft:water')
                        if (block.isAir || (liq && block.isLiquid) || block.permutation.matches('minecraft:light_block')) block.setPermutation(air)
                        return
                    }
                    let state = BlockPermutation.resolve('minecraft:light_block').withState('block_light_level', Number(lig - 1))
                    if (block.isAir || (liq && block.isLiquid) || block.permutation.matches('minecraft:light_block')) block.setPermutation(state)
                    world.setDynamicProperty(dy, time - 1)
                    return
                }

                if (block.isAir || (liq && block.isLiquid) || block.permutation.matches('minecraft:light_block')) block.setPermutation(normal_light)
                world.setDynamicProperty(dy, time - 1)
            } catch (e) {
                if (DEBUG) world.sendMessage(`§7out chuck: ${e}: ${dy}`)
                world.setDynamicProperty(`chuck_unload:${dy}`, 0)
                world.setDynamicProperty(dy, undefined)
            }
        } else if (dy.startsWith('frame:')) {
            try {
                let arr = dy.split(":")
                let dim = arr[1]
                let x = Number(arr[2])
                let y = Number(arr[3])
                let z = Number(arr[4])
                let block = world.getDimension(dim).getBlock({ x: x, y: y, z: z })
                if (!block) return
                if (block.permutation.matches('minecraft:air')) {
                    world.setDynamicProperty(dy, undefined)
                    if (DEBUG) world.sendMessage(`§cclear: §7${dy} §8invaild block L`)
                    return
                }
                let item = block.getItemStack(1)
                if (!item) return
                const typeId = item.typeId.split('minecraft:')[1].toLocaleLowerCase()
                const type = light[typeId]
                if (!type || typeof type.light !== 'number') return
                let lightLevel = Math.max(0, Math.min(15, Math.ceil(type.light * REDUCE_LIGHT)))
                let directions = ['east', 'west', 'north', 'south', '']

                directions.forEach(dir => {
                    let blo = dir ? block[dir](-1) : block
                    let checkAndPut = blo => {
                        if (blo.isLiquid || blo.isAir) put_light(blo, lightLevel, Infinity, true)
                        if (blo.permutation.matches("minecraft:light_block")) put_light(blo, lightLevel, Infinity, true)
                    }
                    for (let i = 0; i < 3; i++) {
                        checkAndPut(blo)
                        blo = blo.offset({ x: 0, y: 1, z: 0 })
                    }
                })
            } catch (e) { }
        }
    })
}, DELAY)

/** @param {Block} block @param {Number} level @param {Player} pl @param {boolean} force   */
function put_light(block, level, pl, force = false) {
    try {
        let set = `light:${block.dimension.id.split(":")[1]}:${block.location.x}:${block.location.y}:${block.location.z}:${level}:${block.permutation.matches("minecraft:water")}:${force ? pl : (pl.id || pl.name || pl.nameTag || pl.typeId)}`
        if (!world.getDynamicProperty(set) && block.permutation.matches("minecraft:light_block")) return
        if (block.isLiquid) if (block.permutation.getState('liquid_depth') !== 0) return
        let state = BlockPermutation.resolve('minecraft:light_block').withState('block_light_level', Number(level))
        world.getDimension(block.dimension.id).getBlock(block.location).setPermutation(state)
        if (!world.getDynamicProperty(set)) world.setDynamicProperty(set, DECAY_LIGHT_TICK)
    } catch (e) { }
}

world.afterEvents.entityRemove.subscribe(data => {
    const { removedEntityId } = data
    world.getDynamicPropertyIds().forEach(dy => {
        if (dy.startsWith("light:") && dy.split(":")[7].toString() === removedEntityId.toString()) {
            if (dy.split(':')[6] === 'true') world.getDimension(dy.split(':')[1]).runCommandAsync(`setblock ${dy.split(':')[2]} ${dy.split(':')[3]} ${dy.split(':')[4]} water`)
            else world.getDimension(dy.split(':')[1]).runCommandAsync(`setblock ${dy.split(':')[2]} ${dy.split(':')[3]} ${dy.split(':')[4]} air`)
            world.setDynamicProperty(dy, undefined)
        }
    })
})

world.afterEvents.playerPlaceBlock.subscribe(data => {
    const { block } = data
    if (isFrame(block)) {
        let bl = `frame:${block.dimension.id.split(":")[1]}:${block.location.x}:${block.location.y}:${block.location.z}`
        if (DEBUG) world.sendMessage(`§aadd:§7 ${bl}`)
        world.setDynamicProperty(bl, 1)
    }
})

world.beforeEvents.playerBreakBlock.subscribe(data => {
    const { block, player } = data
    if (player.matches({ gameMode: GameMode.creative })) return
    if (block.permutation.matches('minecraft:light_block')) data.cancel = true
})

world.beforeEvents.playerBreakBlock.subscribe(data => {
    const { block } = data
    if (isFrame(block)) {
        let bl = `frame:${block.dimension.id.split(":")[1]}:${block.location.x}:${block.location.y}:${block.location.z}`
        if (DEBUG) world.sendMessage(`§4break:§7 ${bl}`)
        world.setDynamicProperty(bl, undefined)
    }
})

if (DEBUG) {
    world.afterEvents.itemUse.subscribe(data => {
        const { itemStack } = data
        if (itemStack.typeId === 'minecraft:barrier') {
            world.getDynamicPropertyIds().map(dy => world.sendMessage(`§7${dy}`))
            world.clearDynamicProperties()
        }
    })
}