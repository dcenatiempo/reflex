const emit = {
    ADD_PLAYER: 'add-player',
    DELETE_PLAYER: 'delete-player',
    UPDATE_ROOM_LIST: 'update-room-list',
    UPDATE_ARENA_CHAT: 'update-arena-chat',
    UPDATE_ROOM_CHAT: 'update-room-chat',
    UPDATE_PLAYER_LIST: 'update-player-list',
    ROOM_PLAYERS_UPDATE: 'room-players-update',
}

const on = {
    HEARTBEAT: 'heartbeat',
}

module.exports = { emit, on };
