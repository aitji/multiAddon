import { system, world } from "@minecraft/server"

let sleep = 0
// const duration = 101
const overworld = world.getDimension('overworld')
system.runInterval(() => {
    const allPl = world.getAllPlayers()
    if (allPl.length > 1) {
        const sleeping = allPl.filter(pl => pl.isSleeping)
        if (sleeping.length >= 1) {
            overworld.runCommand(`weather clear 36000`)
            overworld.runCommand(`time add 20`)
            overworld.runCommand(`title @a actionbar §7${sleeping.map(plr => plr.name).join(", ")} is sleeping..`)
            sleep += 1
        } else {
            //  sleep = 0      
        }
        // if (sleep >= duration) {
        //     sleep = 0
        //     overworld.runCommand(`time set 23459`)
        //     overworld.runCommand(`weather clear 36000`)
        //     overworld.runCommand(`title @a actionbar §7good morning!`)
        // }
    }
})