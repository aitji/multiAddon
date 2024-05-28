import { world, system, BlockPermutation } from "@minecraft/server"
import { getBlock } from "./_function"
const EXPIRE_SECOND = 300 // 300 //
world.afterEvents.playerPlaceBlock.subscribe(data => system.run(() => {
    // if before event support will be cancel -1 set permutation, it kinda cool!
    const { block } = data
    const typeId = getBlock(block)
    if (typeId.includes('campfire')) {
        const cardinal_direction = block.permutation.getState('minecraft:cardinal_direction')
        block.setPermutation(BlockPermutation.resolve(typeId).withState('extinguished', true).withState('minecraft:cardinal_direction', cardinal_direction))
        world.setDynamicProperty(`campfire|${block.x}|${block.y}|${block.z}|${block.dimension.id}|${cardinal_direction}`, 0)
    }
}))

world.afterEvents.playerBreakBlock.subscribe(data => {
    const { brokenBlockPermutation: blockP, block } = data
    if (getBlock(blockP, true).includes('campfire')) {
        const cardinal_direction = blockP.getState('minecraft:cardinal_direction')
        world.setDynamicProperty(`campfire|${block.x}|${block.y}|${block.z}|${block.dimension.id}|${cardinal_direction}`, undefined)
    }
})

system.runInterval(() => {
    const campfire = world.getDynamicPropertyIds().filter(dy => dy.startsWith("campfire|"))
    system.run(() => {
        campfire.forEach(dy => {
            const t = world.getDynamicProperty(dy)
            const [_, x, y, z, dimension, cardinal_direction] = dy.split("|").map((v, i) => i > 0 && i < 4 ? Number(v) : v)
            try {
                const block = world.getDimension(dimension).getBlock({ x: x, y: y, z: z })
                if (block.permutation.getState('extinguished') || !block) world.setDynamicProperty(dy, t)
                else if (t > EXPIRE_SECOND) {
                    block.setPermutation(BlockPermutation.resolve(getBlock(block)).withState('extinguished', true).withState('minecraft:cardinal_direction', cardinal_direction))
                    world.setDynamicProperty(dy, 0)
                } else world.setDynamicProperty(dy, t + 1)
            } catch (e) { }
        })
    })
}, 20)