import {useContext, useEffect, useState} from 'react';
import { AuthUserContext } from '../../contexts/authUser.context';
import axiosInstance from '../../lib/axios';

export function useRooms()  {
    const [rooms, setRooms] = useState<Room[] | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);
    useEffect(() => {
      axiosInstance
        .get("/rooms")
        .then((res) => {
          setRooms(res.data);
        })
        .catch((err : Error) => {
          setError(err);
        })
    }, []);
    return { rooms, setRooms, error };
  }

  export function markMessagesAsRead(room: Room)  {
    return axiosInstance.post(`/rooms/${room.room_id}/seemessages`)
  }

  export function useRoom(roomId: string)  {
    const [room, setRoom] = useState<Room | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);
    useEffect(() => {
      axiosInstance
        .get(`/rooms/${roomId}`)
        .then((res) => {
          setRoom(res.data);
        })
        .catch((err : Error) => {
          setError(err);
        })
    }, []);
    return { room, setRoom, error };
  }