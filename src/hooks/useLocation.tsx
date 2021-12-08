import { useCallback, useEffect, useRef, useState } from "react";
import { Geolocation, Position } from "@capacitor/geolocation";
import { isPlatform } from "@ionic/core";
import { log } from "../utils/logging";

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
      log("useCurrentLocation: there is already a watch id in state");
      log(currentWatchId.current);
      await Geolocation.clearWatch({
        id: watchId,
      });
    }
  }, [timeBetweenLocations]);

  const start = useCallback(async () => {
    log("useCurrentLocation: Starting");
    /* Chequeamos permisos */
    const permissionStatus = await Geolocation.checkPermissions();
    if (permissionStatus.location === "granted") {
      log("useCurrentLocation: Permissions granted");
      const handle = actuallyStart();
      return handle;
    } else if (isPlatform("capacitor")) {
      /* If capacitor porque el plugin no esta implementado en web */
      const newPermissionStatus = await Geolocation.requestPermissions({
        permissions: ["location"],
      });
      if (newPermissionStatus.location === "granted") {
        log("useCurrentLocation: Permissions granted after prompt");
        const handle = actuallyStart();
        return handle;
      }
    }
    log("useCurrentLocation: Dont have location permission granted");
    return 0;
  }, [actuallyStart]);

  const init = useCallback(() => {
    log("useCurrentLocation: Initializing");
    start();
  }, [start]);

  const cleanBeforeUnmount = useCallback(() => {
    log("useCurrentLocation: Cleaning before unmounting");
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
