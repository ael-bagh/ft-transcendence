import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useContext } from "react";
import { NotificationsContext } from "../../contexts/notifications.context";
import Notification from "./Notification";

import { TbBell } from "react-icons/tb";

export default function Notifications() {
  const { notifications } = useContext(NotificationsContext);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="relative flex items-center justify-center">
          {notifications.length > 0 && (
            <div className="absolute top-0 right-0 flex items-center justify-center">
              <span className="h-5 w-5 text-xs font-semibold rounded-full bg-red-500 -mr-1 -mt-1 leading-none flex items-center justify-center">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            </div>
          )}
          <TbBell className="h-8 w-8 text-slate-300" aria-hidden />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-72 origin-top-right max-h-96 overflow-scroll rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {notifications.map((notification) => (
              <Menu.Item key={notification.notification_id}>
                <Notification notification={notification} />
              </Menu.Item>
            ))}
          </div>
          <div className="text-4xl bg-red-500"></div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
