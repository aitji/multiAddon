import { world, system, EquipmentSlot, EntityHealthComponent } from "@minecraft/server"
import { wait } from "./_function"

let lastHealth = 20
world.gameRules.showDeathMessages = true
world.afterEvents.playerSpawn.subscribe((data) => system.run(() => data.player.getComponent("health").setCurrentValue(lastHealth)))

world.afterEvents.entityHealthChanged.subscribe((data) => {
    system.run(async () => {
        if (data.entity.getComponent("health").currentValue === lastHealth) return
        const players = world.getAllPlayers().filter(plr => plr.name !== data.entity.name)
        if (players.length < 1) return
        const cacheNew = data.newValue
        if (cacheNew <= 0) world.gameRules.showDeathMessages = false
        for (const pl of players) {
            /** @type {EntityHealthComponent} */
            const hp = pl.getComponent("health")
            if (cacheNew < lastHealth) pl.playSound('game.player.hurt', { volume: 0.3 })
            hp.setCurrentValue(cacheNew)
            if (cacheNew <= 0) pl.sendMessage(`§7${data.entity.name} just make you ded!`)
        }
        lastHealth = cacheNew
        await wait(18)
        world.gameRules.showDeathMessages = true
    })
}, { entityTypes: ["minecraft:player"] })

world.afterEvents.entityDie.subscribe((data) => {
    system.run(() => {
        lastHealth = 20
        data.deadEntity.getComponent("health").setCurrentValue(20)
    })
}, { entityTypes: ["minecraft:player"] })