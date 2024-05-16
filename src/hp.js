import { world, system, EquipmentSlot } from "@minecraft/server"

let lastHealth = 20
const overworld = world.getDimension("overworld")
overworld.runCommandAsync("gamerule naturalregeneration true")
overworld.runCommandAsync("gamerule doimmediaterespawn true")

world.afterEvents.playerSpawn.subscribe((data) => {
    system.run(() => {
        data.player.getComponent("health").setCurrentValue(lastHealth)
    })
})

world.afterEvents.entityHealthChanged.subscribe((data) => {
    system.run(() => {
        if (data.entity.getComponent("health").currentValue === lastHealth) return
        const players = world.getAllPlayers()
        for (const player of players) player.getComponent("health").setCurrentValue(data.newValue)
        lastHealth = data.newValue
    })
}, { entityTypes: ["minecraft:player"] })

world.afterEvents.entityDie.subscribe((data) => {
    system.run(() => {
        lastHealth = 20
        data.deadEntity.getComponent("health").setCurrentValue(20)
    })
}, { entityTypes: ["minecraft:player"] })