$(document).ready(() => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5098/chathub")
        // Automatic Reconnect => There is a connection, but it is used in cases where it is broken
        .withAutomaticReconnect([1000, 1000, 2000, 3000, 5000, 10000]) // Automatic reconnect times in order in ms
        // Default 0s. - 2s. - 10s. - 30s.
        .build();

    // This function is used in cases where the connection could not be established before.
    async function start() {
        try {
            await connection.start();
        } catch (error) {
            setTimeout(() => start(), 2000);
        }
    }
    
    // connection.start();
    start();

    const status = $("#status");
    function setStatusDiv(alertClass, text) {
        status.addClass(alertClass);
        status.html(text);
        status.fadeIn(2000, () => {
            setTimeout(() => {
                status.fadeOut(2000, () => {
                    status.removeClass(alertClass);
                    status.empty();
                });
            }, 2000);
        });
    }

    // onreconnecting: Event fired/triggered before starting reconnect attempts. Returns error! If you want use as error => {}
    connection.onreconnecting(() => setStatusDiv("alert-primary", "Establishing connection..."));

    // onreconnected: It is the function that is triggered when the reconnection occurs. Returns connectionId! If you want use as connectionId => {}
    connection.onreconnected(() => setStatusDiv("alert-success", "Connection established!"));

    // onclose: Thrown when reconnection attempts fail. Returns connectionId! If you want use as connectionId => {}
    connection.onclose(() => setStatusDiv("alert-danger", "Connection closed!"));
    
    const user = $(".users").first();
    const room = $(".rooms").first();

    user.data("client-name", null);

    room.attr("selected", "selected");
    room.data("group-name", null);

    $(".disabledItem").attr("disabled", "disabled");
    $(".disabledItem").addClass("disabled");

    $("body").on("click", ".users", function () {
        $(".users").each((index, item) => {
            item.classList.remove("active");
        });
        
        $(this).addClass("active");
    });

    $("#btnLogin").click(() => {
        const nickname = $("#txtNickname").val();

        connection.invoke("getNickname", nickname).catch(error => console.log(error));
        
        $(".disabledItem").removeAttr("disabled");
        $(".disabledItem").removeClass("disabled");
    });
    
    connection.on("clientJoined", nickname => setStatusDiv("alert-success", `${nickname} is logged in!`));
            
    connection.on("clients", clients => {
        $("#clients").empty();
        $.each(clients, (index, client) => {
            const newUser = user.clone();
            newUser.removeClass("active");
            newUser.text(client.nickname);
            newUser.data("client-name", client.nickname);
            $("#clients").append(newUser);
        });
    });
    
    function createMessageBox(message, nickname, isMine = false) {
        const messageBox = $(".message").first().clone();
        messageBox.find("p").text(message);
        messageBox.find("h5").eq(isMine).text(nickname);
        $("#messages").append(messageBox);
    }
    
    $("#btnSend").click(() => {
        const clientName = $(".users.active").first().data("client-name"),
            message = $("#txtMessage").val();
        
        connection.invoke("sendMessage", message, clientName).catch(error => console.log(error));
        
        createMessageBox(message, "You", true);
    });
    
    $("#btnSendToGroup").click(() => {
        const groupName = $("#groups option:selected").first().data("group-name");

        if (groupName) {
            const message = $("#txtMessage").val();
            
            connection.invoke("sendMessageToGroup", message, groupName).catch(error => console.log(error));
            
            createMessageBox(message, "You", true);
        }
    });

    connection.on("receiveMessage", (message, nickname) => {
        createMessageBox(message, nickname);
    });
    
    $("#btnCreateRoom").click(() => {
        const roomName = $("#txtRoomName").val();

        connection.invoke("addGroup", roomName).catch(error => console.log(error));
    });
    
    connection.on("groups", groups => {
        $("#groups").empty();
        $("#groups").append(room);
        $.each(groups, (index, group) => {
            const newRoom = room.clone();
            newRoom.removeAttr("selected");
            newRoom.data("group-name", group.name);
            newRoom.text(group.name);
            $("#groups").append(newRoom);
        });
    });

    $("#btnEnterSelectedRooms").click(() => {
        const selectedRoomNames = [];
        $("#groups option:selected").map((index, room) => selectedRoomNames.push($(room).data("group-name")));
        connection.invoke("joinGroups", selectedRoomNames).catch(error => console.log(error));
    });

    $("#groups").change(function () {
        const groupName = $("#groups option:selected").first().data("group-name");

        connection.invoke("getClientsInGroup", groupName).catch(error => console.log(error));
    });
});
