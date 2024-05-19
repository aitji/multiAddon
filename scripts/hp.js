import { world, system, EquipmentSlot, EntityHealthComponent } from "@minecraft/server"

let lastHealth = 20
const overworld = world.getDimension("overworld")
overworld.runCommandAsync("gamerule showdeathmessages true")

world.afterEvents.playerSpawn.subscribe((data) => system.run(() => data.player.getComponent("health").setCurrentValue(lastHealth)))

world.afterEvents.entityHealthChanged.subscribe((data) => {
    system.run(async () => {
        if (data.entity.getComponent("health").currentValue === lastHealth) return
        const players = world.getAllPlayers()
        if (data.newValue <= 0) await overworld.runCommandAsync(`gamerule showdeathmessages false`)
        for (const pl of players.filter(plr => plr.name !== data.entity.name)) {
            /** @type {EntityHealthComponent} */
            const hp = pl.getComponent("health")
            if (data.newValue < lastHealth) pl.playSound('game.player.hurt', { volume: 0.3 })
            hp.setCurrentValue(data.newValue)
            if (data.newValue <= 0) pl.sendMessage(`§7${data.entity.name} make you ded!`)
        }
        lastHealth = data.newValue
        await wait(20)
        overworld.runCommandAsync(`gamerule showdeathmessages true`)
    })
}, { entityTypes: ["minecraft:player"] })

world.afterEvents.entityDie.subscribe((data) => {
    system.run(() => {
        lastHealth = 20
        data.deadEntity.getComponent("health").setCurrentValue(20)
    })
}, { entityTypes: ["minecraft:player"] })

function wait(ticks) {
    return new Promise((resolve) => { system.runTimeout(resolve, ticks) })
}