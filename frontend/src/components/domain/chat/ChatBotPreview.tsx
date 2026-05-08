import { getContrastTextColor } from "../../../lib/utils";

const sampleMessages = [
  {
    id: 1,
    from: "bot",
    text: "Welcome to The Salad House. What would you like to try today?",
  },
  {
    id: 2,
    from: "user",
    text: "Do you have any high-protein salad bowls?",
  },
  {
    id: 3,
    from: "bot",
    text: "Yes! Our Roasted Chickpeas & Paneer Tikka Salad Bowl is one of the most popular high-protein options.",
  },
  {
    id: 4,
    from: "user",
    text: "Great! Can I customize the toppings and dressing?",
  },
  {
  id: 5,
  from: "bot",
  text: "Absolutely! You can customize your veggies, toppings and choose from multiple fresh dressings.",
  },
  {
    id: 6,
    from: "user",
    text: "Perfect, I'll go with extra veggies and spicy chipotle dressing.",
  },
  {
  id: 7,
  from: "bot",
  text: "That sounds delicious! Your order has been added. Would you like to add any drinks or sides?",
},
{
  id: 8,
  from: "user",
  text: "Just a green tea, please.",
},
{
  id: 9,
  from: "bot",
  text: "Got it. Green tea added. Your total comes to ₹380. Would you like to proceed to checkout?",
},
{
  id: 10,
  from: "user",
  text: "Yes, please proceed to checkout.",
},
{
  id: 11,
  from: "bot",
  text: "You'll be redirected to our secure payment gateway. Your order number is TS-98231. Click below to complete your purchase.",
},
{
  id: 12,
  from: "user",
  text: "Confirming payment for ₹380.",
},
{
  id: 13,
  from: "bot",
  text: "Payment successful! Your order is confirmed. It will be ready for pickup in 15-20 minutes. You'll receive an SMS when it's ready.",
},
];


type ChatbotSettingProps = {
  domainName: string,
  domainImageUrl: string,
  themeChatColor: string,
  className?: string
}

export default function ChatBotPreview({
  domainName,
  domainImageUrl,
  themeChatColor,
  className
}: ChatbotSettingProps) {
  return (
    <div className={`shadow-xl rounded-2xl overflow-hidden border border-gray-200 bg-white flex flex-col ${className || "lg:w-[40%] w-full h-[680px]"}`}>
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: themeChatColor, color: getContrastTextColor(themeChatColor) }}>
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse" />
          <div>
            <div className="text-sm font-semibold">{domainName} Bot</div>
            <div className="text-xs text-gray-300"  style={{ backgroundColor: themeChatColor, color: getContrastTextColor(themeChatColor) }}>online</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto bg-gray-50 flex flex-col gap-4">
        {sampleMessages.map((m) =>
          m.from === "bot" ? (
            <div key={m.id} className="flex items-start gap-2">
              <div className="h-9 w-9 rounded-full text-white flex items-center justify-center font-semibold text-sm">
                <img
                  src={domainImageUrl || "/technomart.png"}
                  alt="Logo preview"
                  className="h-8 w-8 align-center object-cover rounded-full"
                />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl text-sm text-gray-800 shadow-sm max-w-[78%]">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <div className="text-white px-4 py-3 rounded-2xl text-sm shadow-sm max-w-[78%]" style={{ backgroundColor: themeChatColor, color: getContrastTextColor(themeChatColor) }}>
                {m.text}
              </div>
            </div>
          )
        )}
      </div>

      <div className="border-t bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button className="px-4 py-2 text-white rounded-full shadow-sm text-sm hover:bg-gray-800 transition"  style={{ backgroundColor: themeChatColor, color: getContrastTextColor(themeChatColor) }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
