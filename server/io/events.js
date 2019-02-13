const emit = {
    ADD_PLAYER: 'add-player',
    DELETE_PLAYER: 'delete-player',
    ROOMS_UPDATE: 'rooms-update',
    UPDATE_ARENA_CHAT: 'update-arena-chat',
    UPDATE_ROOM_CHAT: 'update-room-chat',
    PLAYERS_UPDATE: 'players-update',
    ROOM_PLAYERS_UPDATE: 'room-players-update',
}

const on = {
    HEARTBEAT: 'heartbeat',
}

module.exports = { emit, on };
