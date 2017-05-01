/**
 * Describes the rules for setting up a game. Includes settings for the special rules some boards have.
 *
 *  Some special rules require support from the boards they use:
 *      -Capture the Flag requires the board to define a home zone for each team.
 *      -Frenetic Factory involves rotating sections of the board when a robot touches a flag. There's no GameSetting property for this. It's handled by the board.
 *
 *  The flag being moved by conveyor belts (as in Moving Targets) is considered a standard rule rather than a special rule. There are no maps where flags aren't moved
 *  despite being on conveyor belts.
 *
 *  If a map has no flags, players can only win by destroying all other teams.
 */
class GameSettings {
    readonly maxPlayers: number = 8;

    /** Currently only supports equal players per team. Teams of (maxPlayers / teamCount). For non-team games, set teamCount = maxPlayers. */
    readonly teamCount: number = this.maxPlayers;

    /** If true, in team games, different robots from the team can touch each flag. Otherwise, a single robot must touch all the flags. */
    readonly teamSharesFlags: boolean = false;
    readonly startingOptionCards: number = 0;
    readonly startingOptionCardChoices: number = 0;
    readonly startingDamage: number = 0;
    readonly robotLaserDamageMultiplier: number = 1;
    readonly canPowerDown: boolean = true;
    readonly wrenchesGiveOptionCard: boolean = false;

    /** Number of turns before a destroyed robot respawns. Used in Toggle Boggle. */
    readonly respawnTime: number = 0;

    /** In CTF games, robot must capture the other team's flag and bring it back to their home board. */
    readonly captureTheFlag: boolean = false;

    /** Whenever a robot touches a flag, its team gains control of that flag. First team to control all flags simultaneously wins. */
    readonly controlAllFlags: boolean = false;

    /** In SuperBot games, one player is the SuperBot. The SuperBot fully heals each turn, does double laser damage, and is the only robot that can
      * touch flags. The player who kills the SuperBot becomes the new SuperBot. (See game rules for full details.) */
    readonly superBot: boolean = false;    

    /** In seconds, how long players have to program their robots. No time limit if < 0. */
    readonly maxProgrammingTime: number = -1;

    /** In seconds, how long the last player has to submit their program after all other players have submitted theirs. No time limit if < 0. */
    readonly lastPlayerProgrammingTime: number = 30;

    constructor(settings?: Partial<GameSettings>) {
        $.extend(this, settings);
    }

    static readonly Default = new GameSettings();
    static readonly OneOptionCard = new GameSettings({ startingOptionCards: 1 });   // Flag Fry, Madness Marathon
    static readonly Tricksy = new GameSettings({ startingOptionCards: 1, startingOptionCardChoices: 3 });
    static readonly DoubleDamage = new GameSettings({ robotLaserDamageMultiplier: 2 }); // Set to Kill
    static readonly FactoryRejects = new GameSettings({ startingDamage: 2, canPowerDown: false });
    static readonly OptionWorld = new GameSettings({ wrenchesGiveOptionCard: true });
    static readonly BallLightning = new GameSettings({ maxProgrammingTime: 30 });
    static readonly TightCollar = new GameSettings({ maxProgrammingTime: 60 });
    static readonly SuperBot = new GameSettings({ superBot: true });
    static readonly TandemCarnage = new GameSettings({ maxPlayers: 8, teamCount: 4, teamSharesFlags: true });
    static readonly AllForOne = new GameSettings({ teamCount: 2 });
    static readonly CaptureTheFlag = new GameSettings({ captureTheFlag: true, teamCount: 2 });
    static readonly ToggleBoggle = new GameSettings({ controlAllFlags: true, teamCount: 2 });
    static readonly WarZone = new GameSettings({ startingOptionCards: 1, teamCount: 2 });
}