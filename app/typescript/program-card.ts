enum ProgramCardType {
    MOVE,
    ROTATE
}

class ProgramCard {
    constructor(public type: ProgramCardType, public distance: number, public priority: number) { }

    public toString() {
        return this.getName() + " (priority " + this.priority + ")";
    }

    public getName() {
        if (this.type == ProgramCardType.MOVE) {
            return "Move " + this.distance;
        } else {
            if (this.distance == 1) {
                return "Rotate Right";
            } else if (this.distance == -1) {
                return "Rotate Left";
            } else {
                return "U-Turn";
            }
        }
    }

    private toIconName() {
        if (this.type == ProgramCardType.MOVE)
            return 'icon-' + (this.distance >= 0 ? 'forward' : 'back-up');
        else
            return 'icon-' + this.getName().replace(' ', '-').toLowerCase();
    }

    public toHtml() {
        let distance = this.type == ProgramCardType.MOVE ? Math.abs(this.distance) : '';
        return `
<div class="collapsedIcon">
    <span class="${this.toIconName()}"></span><span class="distance">${distance > 1 ? distance : ''}</span>
</div>
<span class="movement">
    <span class="${this.toIconName()}"></span><span class="amount">${distance}</span>
</span>
<span class="priority">
    <span class="icon-bolt"></span><span class="amount">${this.priority}</span>
</span>`;
    }
}