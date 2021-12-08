import { useCallback, useEffect, useRef, useState } from "react";
import { Geolocation, Position } from "@capacitor/geolocation";
import { isPlatform } from "@ionic/core";

export const useCurrentLocation = (timeBetweenLocations: number) => {
  const [currentLocation, setCurrentLocation] = useState<Position | null>(null);
  const currentWatchId = useRef<string>();

  const stop = useCallback(async () => {
    if (currentWatchId.current) {
      await Geolocation.clearWatch({
        id: currentWatchId.current,
      });
      currentWatchId.current = undefined;
    }
  }, []);

  const actuallyStart = useCallback(async () => {
    const watchId = await Geolocation.watchPosition(
      {
        maximumAge: timeBetweenLocations,
      },
      (position) => {
        setCurrentLocation(() => position);
      }
    );
    if (!currentWatchId.current) {
      currentWatchId.current = watchId;
    } else if (currentWatchId.current !== watchId) {
      console.log("useCurrentLocation: there is already a watch id in state");
      console.log(currentWatchId.current);
      await Geolocation.clearWatch({
        id: watchId,
      });
    }
  }, [timeBetweenLocations]);

  const start = useCallback(async () => {
    console.log("useCurrentLocation: Starting");
    /* Chequeamos permisos */
    const permissionStatus = await Geolocation.checkPermissions();
    if (permissionStatus.location === "granted") {
      console.log("useCurrentLocation: Permissions granted");
      const handle = actuallyStart();
      return handle;
    } else if (isPlatform("capacitor")) {
      /* If capacitor porque el plugin no esta implementado en web */
      const newPermissionStatus = await Geolocation.requestPermissions({
        permissions: ["location"],
      });
      if (newPermissionStatus.location === "granted") {
        console.log("useCurrentLocation: Permissions granted after prompt");
        const handle = actuallyStart();
        return handle;
      }
    }
    console.log("useCurrentLocation: Dont have location permission granted");
    return 0;
  }, [actuallyStart]);

  const init = useCallback(() => {
    console.log("useCurrentLocation: Initializing");
    start();
  }, [start]);

  const cleanBeforeUnmount = useCallback(() => {
    console.log("useCurrentLocation: Cleaning before unmounting");
    stop();
  }, [stop]);

  useEffect(() => {
    init();
    return () => {
      cleanBeforeUnmount();
    };
  }, [cleanBeforeUnmount, init]);

  return {
    currentLocation,
    start,
    stop,
  };
};
