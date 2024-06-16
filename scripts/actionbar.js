import { world, system } from "@minecraft/server"
system.runInterval(() => system.run(() => {
    const players = world.getAllPlayers()
    for (const plr of players) {
        const display = []
        const dynamicProperty = plr.getDynamicPropertyIds().filter(dy => dy.startsWith(`actionbar§:`))
        if (!dynamicProperty) continue
        for (const dy of dynamicProperty) {
            const tir = plr.getDynamicProperty(dy) || 0
            if (tir <= 0) plr.setDynamicProperty(dy, undefined)
            else {
                display.push(dy.slice(11))
                plr.setDynamicProperty(dy, tir - 1)
            }
        }
        plr.onScreenDisplay.setActionBar(display.join("\n§r"))
    }
}), 1)