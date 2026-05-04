import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useFetchStoresQuery } from '../redux/apiSlice';

const useCurrentStoreAdress = () => {
    const [currentStoreAddress, setCurrentStoreAddress] = useState("");
    const selectedStoreId = useSelector((state) => state.store.selectedStoreId);

    // Selected Store Address
    const { data: storeData = { data: [] } } = useFetchStoresQuery();

    const currentStore = storeData?.data?.find(
        (store) => store.storeId === selectedStoreId
    );

    useEffect(() => {
        if (currentStore) {
            setCurrentStoreAddress(currentStore.address);
        }
    }, [currentStore]);
    return currentStoreAddress;
}

export default useCurrentStoreAdress