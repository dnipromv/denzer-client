"use strict";

import Scene from "../../components/structure/Scene";
import Socket from "../../components/socket/Socket";
import Camera from "../../components/Camera";

import Terrain from "./Terrain";
import Vehicle from "./actors/Vehicle";

class BattlegroundScene extends Scene {
    init(mapData, playersData) {
        this._terrain = this._createTerrain(mapData.terrain);
        this._vehicles = this._createVehicles(playersData);
        this._avatar = this._vehicles[this.socket.id];
        
        this._camera = new Camera(this);
        this._camera.zoom = 0.5;
        this._camera.position.set(this._avatar.x, this._avatar.y);
        
        this.socket.on(Socket.EVENT.PLAYER_JOIN, this._onPlayerJoin.bind(this));
        this.socket.on(Socket.EVENT.PLAYER_LEAVE, this._onPlayerLeave.bind(this));

        this.input.onKeyDown(["W", "ArrowUp"], () => {
            this._avatar.faceUp();
        });

        this.input.onKeyDown(["A", "ArrowLeft"], () => {
            this._avatar.faceLeft();
        });

        this.input.onKeyDown(["S", "ArrowDown"], () => {
            this._avatar.faceDown();
        });

        this.input.onKeyDown(["D", "ArrowRight"], () => {
            this._avatar.faceRight();
        });

        this.resize(this.renderer.width, this.renderer.height);
    }

    update(dt) {
        this._avatar.x += this._avatar.velocity * this._avatar.direction.x * dt;
        this._avatar.y += this._avatar.velocity * this._avatar.direction.y * dt;
        this._camera.position.set(this._avatar.x, this._avatar.y);
    }

    resize(width, height) {
        this._camera.viewport.width = width;
        this._camera.viewport.height = height;
    }

    _onPlayerJoin(data) {
        const vehicle = this._createVehicle();
        vehicle.position.set(data.player.position.x, data.player.position.y);
        this._vehicles[data.player.id] = vehicle;

        console.log(data.player.id + " connected. Spawn on position [" + vehicle.x + ", " + vehicle.y + "].");
    }

    _onPlayerLeave(data) {
        this.removeChild(this._vehicles[data.player.id]);
        delete this._vehicles[data.player.id];
        
        console.log(data.player.id + " disconnected");
    }

    _createTerrain(terrainData) {
        return this.addChild(new Terrain(terrainData, this.resources["/assets/images/grassfield.json"]));
    }

    _createVehicles(playersData) {
        const vehicles = {};
        for (const playerData of playersData) {
            const vehicle = this._createVehicle();
            vehicle.position.set(playerData.position.x, playerData.position.y);
            vehicles[playerData.id] = vehicle;
        }
        return vehicles;
    }

    _createVehicle() {
        return this.addChild(new Vehicle());
    }
}

export default BattlegroundScene;