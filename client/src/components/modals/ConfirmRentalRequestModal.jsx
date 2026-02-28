import { Calendar, Clock, ClockPlus, Home, MapPin, X } from "lucide-react";
import useConfirmRentalRequestModalStore from "../../stores/creditModalStores/useConfirmRentalRequestModalStore";
import RCC from "../CacheCreditCard/RCC";
import BCC from "../CacheCreditCard/BCC";
import { differenceInDays } from "date-fns";
import { useEffect, useState } from "react";
import useUserStore from "../../stores/authStores/useUserStore";
import api from "../../lib/api";
import Swal from "sweetalert2";
import useCreditModalStore from "../../stores/creditModalStores/useCreditModalStore";

const ConfirmRentalRequestModal = () => {
  const {
    closeConfirmRentalRequestModal,
    isConfirmRentalRequestModalOpen,
    data,
  } = useConfirmRentalRequestModalStore();
  const { closeCreditModal } = useCreditModalStore();
  const { currentUser } = useUserStore();

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [selectedMethod, setSelectedMethod] = useState("BRITTOO_TERMINAL");
  const [pickupPoint, setPickupPoint] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  //const { calculatePricePerDay } = usePriceCalculate();
  const numberOfDays =
    differenceInDays(
      data?.rentalDetails?.final.toDateString(),
      data?.rentalDetails?.initial?.toDateString(),
    ) + 1;
  // const pricePerDay = calculatePricePerDay(
  //   data?.rentalDetails?.product?.omv,
  //   data?.rentalDetails?.product?.productCondition,
  //   data?.rentalDetails?.product?.productAge,
  //   data?.rentalDetails?.product?.owner.securityScore,
  //   numberOfDays,
  // );
  const [pricePerDay, setPricePerDay] = useState(0);
  const [pricePerHour, setPricePerHour] = useState(0);
  const [numberOfHours, setNumberOfHours] = useState(0);
  const [isHourlyRental, setIsHourlyRental] = useState(false);

  useEffect(() => {
    if(data?.rentalDetails) {
      setPricePerDay(data?.rentalDetails?.pricePerDay);
      setIsHourlyRental(data?.rentalDetails?.isHourlyRental);
      setPricePerHour(data?.rentalDetails?.pricePerHour);
      setNumberOfHours(data?.rentalDetails?.numberOfHours);
    }
  }, [data?.rentalDetails]);


  const conditionColor =
    {
      NEW: "text-green-400",
      LIKE_NEW: "text-emerald-400",
      GOOD: "text-teal-400",
      FAIR: "text-yellow-400",
      POOR: "text-red-400",
    }[data?.rentalDetails?.product?.productCondition] ||
    "bg-gray-100 text-gray-800";
  const methods = [
    {
      id: "BRITTOO_TERMINAL",
      label: "Terminal Pickup",
      icon: MapPin,
      description: "Collect from our terminal (No Charge)",
    },
    {
      id: "HOME",
      label: "Home Delivery",
      icon: Home,
      description: "Delivered to your address. (10TK extra charge)",
    },
  ];
  const conditionLabel =
    {
      NEW: "🆕 New",
      LIKE_NEW: "✨ Like New",
      GOOD: "👍 Good",
      FAIR: "👌 Fair",
      POOR: "⚠️ Poor",
    }[data?.rentalDetails?.product?.productCondition] ||
    data?.rentalDetails?.product?.productCondition;

  function conditionalCeilOrFloor(value) {
    const decimalPart = value - Math.floor(value);

    if (decimalPart >= 0.5) {
      return {
        value: Math.ceil(value),
        ceil: true,
      };
    } else {
      return {
        value: Math.floor(value),
        floor: true,
      };
    }
  }

  const handleConfirm = async () => {
    if (selectedMethod === "HOME" && !deliveryAddress) {
      return alert("Please enter the delivery address");
    }
    if (selectedMethod === "BRITTOO_TERMINAL" && !pickupPoint) {
      return alert("Please enter your nearest pickup point");
    }
    if (!phoneNumber) {
      return alert("Please Enter Your phone number");
    }
    if (
      !data?.rentalDetails?.product?.id ||
      !data?.rentalDetails?.product?.owner?.id
    ) {
      return alert("Product or owner info not found.");
    }
    try {
      setLoading(true);
      const rentalData = {
        productId: data?.rentalDetails?.product?.id,
        coupon: data?.rentalDetails?.coupon ? data?.rentalDetails?.coupon : null,
        requesterId: currentUser.id,
        ownerId: data?.rentalDetails?.product?.owner.id,
        rentalStartDate: new Date(data?.rentalDetails?.initial).toISOString(),
        rentalEndDate: new Date(data?.rentalDetails?.final).toISOString(),
        totalDays: parseInt(numberOfDays),
        renterCollectionMethod: selectedMethod,
        renterPhoneNumber: "+880" + phoneNumber.trim(),
        deliveryAddress:
          selectedMethod === "HOME" ? deliveryAddress : null,
        pickupPoint: selectedMethod === "BRITTOO_TERMINAL" ? pickupPoint : null,
        paidWithBcc: !!data?.selectedBcc,
        bccWalletId: data?.bccWallet?.id,
        usedBccAmount: Number(data?.selectedBcc || 0),
        paidWithRcc: data?.selectedRCCs?.length > 0 ? true : false,
        usedRccData: data?.selectedRCCs?.map((item) => ({
          rccId: item.rcc.id,
          selectedAmount: item.selectedAmount,
        })),
        isHourlyRental: data?.rentalDetails?.isHourlyRental,
        pricePerHour: isHourlyRental ? pricePerHour : null,
        totalHours: isHourlyRental ? numberOfHours : null,
        pricePerDay,
        startingHour: isHourlyRental ? (data?.rentalDetails?.pickerValue?.hour + " " + data?.rentalDetails?.pickerValue?.period) : null,
      };
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/api/v1/rental-requests/create-request",
        rentalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.data.success) {
        Swal.fire({
          icon: "error",
          title: "OOPS!",
          text: res.data.message || "Something Went Wrong",
        });
        return;
      }
      Swal.fire({
        icon: "success",
        title: "Rental request placed successfully",
        text: "Waiting for owner's approval.",
        footer:
          '<a href="/dashboard/placed-requests" style="color: #2563eb; text-decoration: underline;">Go to my requests</a>',
      });
    } catch (error) {
      console.log(error);
      if (error.response?.data?.errorType == "VERIFICATION_ERROR") {
        Swal.fire({
          icon: "error",
          title: "OOPS!",
          text: "Please verify yourself before renting something.",
          footer:
            '<a href="/verify-user" style="color: #2563eb; text-decoration: underline;">Goto Verify</a>',
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "OOPS!",
          text: error.response?.data?.message || "Something went wrong!",
        });
      }
    } finally {
      setLoading(false);
      closeConfirmRentalRequestModal();
      closeCreditModal();
      data?.setSelectedBcc(0);
      data?.setSelectedRCCs([]);
    }
  };

  if (!isConfirmRentalRequestModalOpen) {
    return null;
  }

  return (
    <div
      id="authentication-modal"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeConfirmRentalRequestModal();
        }
      }}
    >
      <div className="relative p-4 w-full max-w-[760px] max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm flex flex-col sm:max-h-[95vh] max-h-[88vh]">
          <div className="flex items-center justify-between bg-gray-100 border-b rounded-t border-gray-200 flex-shrink-0 pb-2 sm:pb-4">
            <div
              id="credit-calc"
              className="flex flex-col items-center text-center w-full"
            >
              <h3 className="text-lg font-semibold text-gray-700 mt-2">
                Confirm Your Request
              </h3>
              <p className="text-xs text-gray-600">
                Start your rental journey🤩
              </p>
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-xs w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeConfirmRentalRequestModal}
            >
              <X />
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <div className="overflow-y-auto">
            <div className="mt-3 sm:mt-6 mx-4 flex gap-4 items-start border-b border-gray-200 pb-4">
              <img
                src={`${baseUrl}${data?.rentalDetails?.product?.optimizedImages[0]}`}
                alt="image"
                className="w-24 h-24 object-cover"
              />
              <div>
                <h2 className="text-lg p-0 font-semibold">
                  {data?.rentalDetails?.product?.name}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap gap-1">
                    {data?.rentalDetails?.product?.tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter((tag) => tag.length > 0)
                      .slice(0, 3)
                      .map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs md:text-xs bg-green-50 text-green-700 rounded-md border border-green-100"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                  </div>
                </div>

                <p className="text-xs text-gray-600 mt-2">
                  <span className="font-semibold">Condition:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-md text-xs ${conditionColor}`}
                  >
                    {conditionLabel}
                  </span>
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  <span className="font-semibold">Product Age: </span>{" "}
                  <span className={`px-2 py-1 rounded-md text-xs`}>
                    Less than {data?.rentalDetails?.product?.productAge}{" "}
                    {data?.rentalDetails?.product?.productAge == 1
                      ? "Year"
                      : "Years"}
                  </span>
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  <span className="font-semibold">Original Market Price: </span>{" "}
                  <span className={`px-2 py-1 rounded-md text-xs`}>
                    BDT {data?.rentalDetails?.product?.omv}.00
                  </span>
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  <span className="font-semibold">Quantity: </span>{" "}
                  <span className={`px-2 py-1 rounded-md text-xs`}>
                    {data?.rentalDetails?.product?.quantity}
                  </span>
                </p>
              </div>
            </div>
            {
              data?.rentalDetails?.isHourlyRental ? (
                <div className="mx-4 py-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Rental Period <span className="text-base italic text-cyan-600">(Hourly Rental)</span>
                  </h2>
                  <div className="w-fit border-gray-300 space-y-1">
                    <h3 className="text-sm text-gray-800 flex gap-1">
                      <span className="font-medium flex items-center gap-1"> <Calendar size={12} /> Rental Date:</span>{" "}
                      {data?.rentalDetails?.initial.toDateString()}
                    </h3>
                    <h3 className="text-sm text-gray-800 flex gap-1">
                      <span className="font-medium flex items-center gap-1"><Clock size={12} /> Starting Hour:</span>{" "}
                      {data?.rentalDetails?.pickerValue.hour}:00 {data?.rentalDetails?.pickerValue.period}
                    </h3>
                    <h3 className="text-sm text-gray-800 flex gap-1">
                      <span className="font-medium flex items-center gap-1"><ClockPlus size={12} /> Total Hours:</span>{" "}
                      {data?.rentalDetails?.pickerValue.hour}
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="mx-4 py-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Rental Period <span className="text-base italic text-cyan-600">(Daily Rental)</span>
                  </h2>
                  <div className="border-b w-fit border-gray-300 pb-1 space-y-1">
                    <h3 className="text-sm text-gray-800 ">
                      <span className="font-medium">Start date:</span>{" "}
                      {data?.rentalDetails?.initial.toDateString()}
                    </h3>
                    <h3 className="text-sm text-gray-800 ">
                      <span className="font-medium">End date: </span>
                      {data?.rentalDetails?.final?.toDateString()}
                    </h3>
                  </div>
                  <h3 className="text-sm text-gray-800 mt-1">
                    <span className="font-medium">Total Days:</span> {numberOfDays}
                  </h3>
                  {/* one case for initial == final */}
                </div>
              )
            }
            <div>
              <div className="max-w-sm mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Collection Method
                </h3>

                <div className="space-y-3">
                  {methods.map((method) => {
                    const IconComponent = method.icon;
                    const isSelected = selectedMethod === method.id;

                    return (
                      <label
                        key={method.id}
                        className={`
                flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isSelected
                            ? "border-green-500 bg-green-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }
              `}
                      >
                        <input
                          type="radio"
                          name="collectionMethod"
                          value={method.id}
                          checked={isSelected}
                          onChange={(e) => setSelectedMethod(e.target.value)}
                          className="sr-only"
                        />

                        <div
                          className={`
                flex items-center justify-center w-10 h-10 rounded-full mr-4 transition-colors
                ${isSelected
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-600"
                            }
              `}
                        >
                          <IconComponent size={20} />
                        </div>

                        <div className="flex-1">
                          <div
                            className={`font-medium ${isSelected ? "text-green-900" : "text-gray-900"
                              }`}
                          >
                            {method.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {method.description}
                          </div>
                        </div>

                        <div
                          className={`
                w-5 h-5 rounded-full border-2 ml-4 transition-all
                ${isSelected
                              ? "border-green-500 bg-green-500"
                              : "border-gray-300"
                            }
              `}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                <label
                  htmlFor="phone"
                  className="flex flex-col gap-1.5 w-full mt-4"
                >
                  <span className="text-sm font-medium text-gray-700">
                    Phone Number
                  </span>
                  <div className="flex items-center border bg-white border-gray-300 rounded-md w-full focus-within:border-gray-400">
                    <span className="flex items-center gap-1 px-3 text-xs md:text-sm text-gray-600 bg-gray-100 border-r border-gray-300 rounded-l-md">
                      <img
                        src="https://flagcdn.com/w40/bd.png"
                        alt="BD Flag"
                        className="w-5 h-4 object-cover"
                      />
                      +880
                    </span>

                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      maxLength={10}
                      id="phone"
                      className="w-full px-2 py-2 md:py-3 md:px-4 focus:outline-none text-xs md:text-sm rounded-r-md"
                      placeholder="1XXXXXXXXX"
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </label>

                {selectedMethod === "HOME" ? (
                  <label
                    htmlFor="deliveryAddress"
                    className="flex flex-col gap-1.5 w-full"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Delivery Address
                    </span>
                    <textarea
                      type="text"
                      required
                      id="deliveryAddress"
                      className="border h-24 bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                      placeholder="Enter your delivery address"
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </label>
                ) : (
                  <div
                    htmlFor="pickupPoint"
                    className="flex flex-col gap-1.5 mt-1"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Select Pickup Point
                    </span>
                    <select
                      name="pickupPoint"
                      id="pickupPoint"
                      required
                      className="border bg-white border-gray-300 rounded-md px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm w-full sm:max-w-xl"
                      onChange={(e) => setPickupPoint(e.target.value)}
                    >
                      <option value="">Please select</option>
                      <option value="CSE_1">CSE-1</option>
                      <option value="ADMIN_1">Admin-1</option>
                      <option value="BANGABANDHU_HALL_1">
                        Bangabandhu Hall-1
                      </option>
                      <option value="ZIA_HALL_1">Zia Hall-1</option>
                      <option value="LIBRARY_1">Library-1</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {
              data?.rentalDetails?.isHourlyRental ? (
                <div className="mx-4 py-4 mt-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Total Amount
                  </h2>
                  <div className="border-b w-fit border-gray-300 pb-1 space-y-1">
                    <h3 className="text-sm text-gray-800 ">
                      <span className="">Price Per Hour: </span>{" "}
                      <span className="font-medium">৳{pricePerHour}</span>
                    </h3>
                    <h3 className="text-sm text-gray-800 ">
                      <span className="">Subtotal Price: </span>
                      <span className="font-medium">
                        ৳{((parseFloat(pricePerHour) * parseFloat(numberOfHours)) || 0.00).toFixed(2)}{" "}
                        <span className="text-[11px] font-normal">
                          (For {numberOfHours} {numberOfHours == 1 ? "Hour" : "Hours"})
                        </span>
                      </span>
                    </h3>
                    <h3 className="text-sm text-gray-800 ">
                      <span className="">Delivery Charge: </span>
                      <span className="font-medium">
                        ৳{selectedMethod === "HOME" ? "10" : "0"}
                      </span>
                    </h3>
                  </div>
                  <h3 className="text-sm text-gray-800 mt-1">
                    <span className="">Total </span>{" "}
                    <span className="font-bold">
                      ≈ BDT{" "}
                      {
                        conditionalCeilOrFloor(
                          pricePerHour * numberOfHours +
                          (selectedMethod === "HOME" ? 10 : 0),
                        ).value
                      }{" "}
                      <span className="text-[11px] font-normal ml-0.5">
                        {conditionalCeilOrFloor(
                          pricePerHour * numberOfHours +
                          (selectedMethod === "HOME" ? 10 : 0),
                        ).ceil
                          ? "(ceiled)"
                          : "(floored)"}
                      </span>
                    </span>
                  </h3>

                </div>
              ) : (
                <div className="mx-4 py-4 mt-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Total Amount
                  </h2>
                  <div className="border-b w-fit border-gray-300 pb-1 space-y-1">
                    <h3 className="text-sm text-gray-800 ">
                      <span className="">Price Per Day: </span>{" "}
                      <span className="font-medium">৳{pricePerDay}</span>
                    </h3>
                    <h3 className="text-sm text-gray-800 ">
                      <span className="">Subtotal Price: </span>
                      <span className="font-medium">
                        ৳{(pricePerDay * numberOfDays).toFixed(2)}{" "}
                        <span className="text-[11px] font-normal">
                          (For {numberOfDays} {numberOfDays == 1 ? "Day" : "Days"})
                        </span>
                      </span>
                    </h3>
                    <h3 className="text-sm text-gray-800 ">
                      <span className="">Delivery Charge: </span>
                      <span className="font-medium">
                        ৳{selectedMethod === "HOME" ? "10" : "0"}
                      </span>
                    </h3>
                  </div>
                  <h3 className="text-sm text-gray-800 mt-1">
                    <span className="">Total </span>{" "}
                    <span className="font-bold">
                      ≈ BDT{" "}
                      {
                        conditionalCeilOrFloor(
                          pricePerDay * numberOfDays +
                          (selectedMethod === "HOME" ? 10 : 0),
                        ).value
                      }{" "}
                      <span className="text-[11px] font-normal ml-0.5">
                        {conditionalCeilOrFloor(
                          pricePerDay * numberOfDays +
                          (selectedMethod === "HOME" ? 10 : 0),
                        ).ceil
                          ? "(ceiled)"
                          : "(floored)"}
                      </span>
                    </span>
                  </h3>

                </div>
              )
            }

            <div className="space-y-4 mx-4 mt-2">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Selected Credits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {data?.selectedRCCs?.map((selectedRcc) => (
                  <RCC
                    handleSelect={() => { }}
                    key={selectedRcc.rcc.id}
                    rcc={selectedRcc.rcc}
                    selectedRCCs={data?.selectedRCCs}
                    inRRModal={true}
                  />
                ))}
              </div>
              {data?.selectedBcc > 0 && (
                <div>
                  <BCC
                    handleSelect={() => { }}
                    bccWallet={data?.bccWallet}
                    selectedBcc={data?.selectedBcc}
                    inRRModal={true}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="py-4 md:py-5 border-t mx-4 border-gray-200 flex-shrink-0 mt-4">
            {loading ? (
              <button
                onClick={handleConfirm}
                className="w-full text-gray-600 hover:text-white bg-gray-50 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer border-2 border-gray-600 shadow-md transition-all duration-300"
              >
                Please Hold Tight....
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                className="w-full text-green-600 hover:text-white bg-gray-50 hover:bg-green-600 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer border-2 border-green-600 shadow-md transition-all duration-300"
              >
                Confirm Rental Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRentalRequestModal;
