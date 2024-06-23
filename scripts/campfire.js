import { world, system, BlockPermutation } from "@minecraft/server"
import { DEBUG, getBlock } from "./_function"
import { get } from "./main"

const ID = 'campfire'

world.afterEvents.playerPlaceBlock.subscribe(data => system.run(() => {
    if (!get(ID)) return
    const DY = world.getDynamicProperty(ID) || '300§:1'
    const parts = DY.split('§:')
    const PLACE = parts[1] === '1'

    const { block } = data
    const typeId = getBlock(block)
    if (typeId?.includes('campfire')) {
        const caD = block.permutation.getState('minecraft:cardinal_direction')
        world.setDynamicProperty(`campfire|${block.x}|${block.y}|${block.z}|${block.dimension.id}|${caD}`, 0)
        if (!PLACE) return
        block.setPermutation(BlockPermutation.resolve(typeId)
            .withState('extinguished', true)
            .withState('minecraft:cardinal_direction', caD)
        )
    }
}))

world.afterEvents.playerBreakBlock.subscribe(data => {
    if (!get(ID)) return
    const { brokenBlockPermutation: blockP, block } = data
    if (getBlock(blockP, true)?.includes('campfire')) {
        const cardinalDirection = blockP.getState('minecraft:cardinal_direction')
        world.setDynamicProperty(`campfire|${block.x}|${block.y}|${block.z}|${block.dimension.id}|${cardinalDirection}`, undefined)
    }
})

system.runInterval(() => {
    if (!get(ID)) return
    const DY = world.getDynamicProperty(ID) || '300§:1'
    const parts = DY.split('§:')
    const EXPIRE_SECOND = parseInt(parts[0]) || 300
    const campfireProperties = world.getDynamicPropertyIds().filter(id => id.startsWith("campfire|"))

    campfireProperties.forEach(dy => {
        const t = world.getDynamicProperty(dy)
        const [_, x, y, z, dimension, cardinalDirection] = dy.split("|").map((v, i) => (i > 0 && i < 4 ? Number(v) : v))

        try {
            const block = world.getDimension(dimension).getBlock({ x, y, z })

            if (!block || block.permutation.matches('minecraft:air')) world.setDynamicProperty(dy, undefined)
            else if (block.permutation.getState('extinguished')) world.setDynamicProperty(dy, t)
            else if (t > EXPIRE_SECOND) {
                block.setPermutation(BlockPermutation.resolve(getBlock(block))
                    .withState('extinguished', true)
                    .withState('minecraft:cardinal_direction', cardinalDirection)
                )
                world.setDynamicProperty(dy, 0)
            } else world.setDynamicProperty(dy, t + 1)
        } catch (e) { if (DEBUG) console.error(`Error processing dynamic property ${dy}: ${e}`) }
    })
}, 20)