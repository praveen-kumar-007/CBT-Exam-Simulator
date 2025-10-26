import { ExamData } from '../types';

export const examData: ExamData = {
  examTitle: "General Aptitude & Knowledge Assessment",
  durationInMinutes: 90,
  sections: [
    {
      name: "Section 1: General Knowledge",
      questions: [
        {
          id: "s1q1",
          text: "What is the capital of Japan?",
          options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
          answer: "Tokyo",
        },
        {
          id: "s1q2",
          text: "Who wrote 'Romeo and Juliet'?",
          options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
          answer: "William Shakespeare",
        },
        {
          id: "s1q3",
          text: "What is the largest planet in our solar system?",
          options: ["Earth", "Mars", "Jupiter", "Saturn"],
          answer: "Jupiter",
        },
        {
          id: "s1q4",
          text: "In which year did the Titanic sink?",
          options: ["1905", "1912", "1918", "1923"],
          answer: "1912",
        },
        {
            id: "s1q5",
            text: "What is the chemical symbol for gold?",
            options: ["Au", "Ag", "Go", "Gd"],
            answer: "Au"
        },
        {
            id: "s1q6",
            text: "Who is known as the father of the Indian Constitution?",
            options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Dr. B.R. Ambedkar", "Sardar Vallabhbhai Patel"],
            answer: "Dr. B.R. Ambedkar"
        },
        {
            id: "s1q7",
            text: "What is the smallest continent by land area?",
            options: ["Europe", "Antarctica", "Australia", "South America"],
            answer: "Australia"
        },
        {
            id: "s1q8",
            text: "Which gas is most abundant in the Earth's atmosphere?",
            options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
            answer: "Nitrogen"
        },
        {
            id: "s1q9",
            text: "What is the currency of the United Kingdom?",
            options: ["Euro", "Dollar", "Yen", "Pound Sterling"],
            answer: "Pound Sterling"
        },
        {
            id: "s1q10",
            text: "Which artist painted the Mona Lisa?",
            options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
            answer: "Leonardo da Vinci"
        },
        {
            id: "s1q11",
            text: "Mount Everest is located in which country?",
            options: ["India", "China", "Nepal", "Bhutan"],
            answer: "Nepal"
        },
        {
            id: "s1q12",
            text: "What is the hardest natural substance on Earth?",
            options: ["Gold", "Iron", "Diamond", "Quartz"],
            answer: "Diamond"
        },
        {
            id: "s1q13",
            text: "Which planet is known as the Red Planet?",
            options: ["Venus", "Mars", "Jupiter", "Mercury"],
            answer: "Mars"
        },
        {
            id: "s1q14",
            text: "What is the main component of the sun?",
            options: ["Oxygen", "Helium", "Hydrogen", "Carbon"],
            answer: "Hydrogen"
        },
        {
            id: "s1q15",
            text: "Who invented the telephone?",
            options: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Guglielmo Marconi"],
            answer: "Alexander Graham Bell"
        },
        {
            id: "s1q16",
            text: "The Great Wall of China was primarily built to protect against invasions from which group?",
            options: ["The Huns", "The Mongols", "The Vikings", "The Romans"],
            answer: "The Mongols"
        },
        {
            id: "s1q17",
            text: "What is the largest ocean on Earth?",
            options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
            answer: "Pacific Ocean"
        },
        {
            id: "s1q18",
            text: "Which country is known as the Land of the Rising Sun?",
            options: ["China", "South Korea", "Japan", "Thailand"],
            answer: "Japan"
        },
        {
            id: "s1q19",
            text: "What is the chemical formula for water?",
            options: ["CO2", "O2", "H2O", "NaCl"],
            answer: "H2O"
        },
        {
            id: "s1q20",
            text: "Who was the first person to walk on the moon?",
            options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Michael Collins"],
            answer: "Neil Armstrong"
        },
      ],
    },
    {
      name: "Section 2: Logical Reasoning",
      questions: [
        {
          id: "s2q1",
          text: "Which number should come next in the series: 2, 6, 12, 20, 30, ___?",
          options: ["42", "40", "36", "48"],
          answer: "42",
        },
        {
          id: "s2q2",
          text: "If FRIEND is coded as HUMJGT, how is CANDLE written in that code?",
          options: ["EDRIRL", "DCQHQK", "ESJFME", "FYOBOC"],
          answer: "EDRIRL",
        },
        {
          id: "s2q3",
          text: "A man walks 5 km toward south and then turns to the right. After walking 3 km he turns to the left and walks 5 km. Now in which direction is he from the starting place?",
          options: ["West", "South", "North-East", "South-West"],
          answer: "South-West",
        },
        {
          id: "s2q4",
          text: "Look at this series: 1, 4, 9, 16, 25, ___. What number should come next?",
          options: ["36", "49", "35", "42"],
          answer: "36"
        },
        {
          id: "s2q5",
          text: "Doctor is to Patient as Lawyer is to ___?",
          options: ["Judge", "Court", "Client", "Law"],
          answer: "Client"
        },
        {
          id: "s2q6",
          text: "Which word does NOT belong with the others?",
          options: ["Carrot", "Radish", "Potato", "Cabbage"],
          answer: "Cabbage"
        },
        {
          id: "s2q7",
          text: "AZ, BY, CX, ___?",
          options: ["DV", "DW", "DU", "DX"],
          answer: "DW"
        },
        {
          id: "s2q8",
          text: "Ocean is to Water as Glacier is to ___?",
          options: ["Mountain", "Ice", "Cold", "Snow"],
          answer: "Ice"
        },
        {
          id: "s2q9",
          text: "If 'WATER' is written as 'YCVGT', how is 'EARTH' written?",
          options: ["GCTVM", "GCTVN", "FDSUI", "GDSUI"],
          answer: "GCTVM"
        },
        {
          id: "s2q10",
          text: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?",
          options: ["His own", "His son's", "His father's", "His nephew's"],
          answer: "His son's"
        },
        {
          id: "s2q11",
          text: "Find the odd number pair: (3, 9), (4, 16), (5, 25), (6, 30)",
          options: ["(3, 9)", "(4, 16)", "(5, 25)", "(6, 30)"],
          answer: "(6, 30)"
        },
        {
          id: "s2q12",
          text: "A is B's sister. C is B's mother. D is C's father. E is D's mother. Then, how is A related to D?",
          options: ["Grandmother", "Grandfather", "Daughter", "Granddaughter"],
          answer: "Granddaughter"
        },
        {
          id: "s2q13",
          text: "Look at this series: 1, 1, 2, 3, 5, 8, ___. What number should come next?",
          options: ["11", "12", "13", "14"],
          answer: "13"
        },
        {
          id: "s2q14",
          text: "Pen is to Write as Needle is to ___?",
          options: ["Stitch", "Cloth", "Thread", "Sew"],
          answer: "Sew"
        },
        {
          id: "s2q15",
          text: "Which word does NOT belong with the others?",
          options: ["Tiger", "Lion", "Leopard", "Cow"],
          answer: "Cow"
        },
        {
          id: "s2q16",
          text: "If 'ZEBRA' can be written as '2652181', how can 'COBRA' be written?",
          options: ["3152181", "3182151", "3152811", "3151281"],
          answer: "3152181"
        },
        {
          id: "s2q17",
          text: "Rahul started from his house and walked 4 km East, then he turned right and walked 3 km. How far is he from his starting point?",
          options: ["3 km", "4 km", "5 km", "7 km"],
          answer: "5 km"
        },
        {
          id: "s2q18",
          text: "Statements: All pens are pencils. All pencils are books. Conclusions: I. All pens are books. II. All books are pens.",
          options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
          answer: "Only I follows"
        },
        {
          id: "s2q19",
          text: "Moon is to Satellite as Earth is to ___?",
          options: ["Sun", "Planet", "Solar System", "Star"],
          answer: "Planet"
        },
        {
          id: "s2q20",
          text: "Look at this series: 3, 7, 15, 31, 63, ___?",
          options: ["125", "126", "127", "128"],
          answer: "127"
        },
        {
          id: "s2q21",
          text: "Which word does NOT belong with the others?",
          options: ["January", "May", "July", "November"],
          answer: "November"
        },
        {
          id: "s2q22",
          text: "If in a certain language, 'NOIDA' is coded as 'OPJEB', how is 'DELHI' coded?",
          options: ["EFMIJ", "EFMIK", "EFMJI", "EGMJI"],
          answer: "EFMIJ"
        },
        {
          id: "s2q23",
          text: "I am facing East. I turn 100 degrees in the clockwise direction and then 145 degrees in the anti-clockwise direction. Which direction am I facing now?",
          options: ["North", "North-East", "South", "South-West"],
          answer: "North-East"
        },
        {
          id: "s2q24",
          text: "Statements: Some cats are dogs. All dogs are goats. Conclusions: I. Some cats are goats. II. All goats are cats.",
          options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
          answer: "Only I follows"
        },
        {
          id: "s2q25",
          text: "Chair is to Furniture as Shoe is to ___?",
          options: ["Socks", "Leather", "Footwear", "Leg"],
          answer: "Footwear"
        },
        {
          id: "s2q26",
          text: "Which word does NOT belong with the others?",
          options: ["Rectangle", "Square", "Circle", "Triangle"],
          answer: "Circle"
        },
        {
          id: "s2q27",
          text: "If 'APPLE' is coded as '25563', and 'RUNG' is coded as '7148', then 'PURPLE' is coded as?",
          options: ["517563", "517536", "517653", "517356"],
          answer: "517563"
        },
        {
          id: "s2q28",
          text: "Pointing to a lady, a man said, 'The son of her only brother is the brother of my wife.' How is the lady related to the man?",
          options: ["Mother-in-law", "Sister", "Mother", "Sister of father-in-law"],
          answer: "Sister of father-in-law"
        },
        {
          id: "s2q29",
          text: "Country is to President as State is to ___?",
          options: ["Chief Minister", "Governor", "Prime Minister", "Mayor"],
          answer: "Governor"
        },
        {
          id: "s2q30",
          text: "Look at this series: 8, 6, 9, 23, 87, ___. What number should come next?",
          options: ["128", "226", "324", "429"],
          answer: "429"
        },
        {
          id: "s2q31",
          text: "CUP : LIP :: BIRD : ?",
          options: ["BUSH", "GRASS", "FOREST", "BEAK"],
          answer: "BEAK"
        },
        {
          id: "s2q32",
          text: "If A + B means A is the brother of B; A - B means A is the sister of B and A x B means A is the father of B. Which of the following means that C is the son of M?",
          options: ["M - N x C + F", "F - C + N x M", "M x N - C + F", "M + N - C x F"],
          answer: "M x N - C + F"
        },
        {
          id: "s2q33",
          text: "A man is facing North-West. He turns 90° in the clockwise direction, then 180° in the anti-clockwise direction and then another 90° in the same direction. Which direction is he facing now?",
          options: ["South", "South-West", "West", "South-East"],
          answer: "South-East"
        },
        {
          id: "s2q34",
          text: "Find the odd one out: (2, 5), (6, 37), (3, 10), (4, 18)",
          options: ["(2, 5)", "(6, 37)", "(3, 10)", "(4, 18)"],
          answer: "(4, 18)"
        },
        {
          id: "s2q35",
          text: "Statements: All the harmoniums are instruments. All the instruments are flutes. Conclusions: I. All the flutes are instruments. II. All the harmoniums are flutes.",
          options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
          answer: "Only II follows"
        },
        {
          id: "s2q36",
          text: "Odometer is to mileage as compass is to:",
          options: ["speed", "hiking", "needle", "direction"],
          answer: "direction"
        },
        {
          id: "s2q37",
          text: "Look at this series: F2, __, D8, C16, B32, ... What term should fill the blank?",
          options: ["A16", "G4", "E4", "E3"],
          answer: "E4"
        },
        {
          id: "s2q38",
          text: "P is the brother of Q and R. S is R's mother. T is P's father. Which of the following statements cannot be definitely true?",
          options: ["T is Q's father", "S is P's mother", "P is S's son", "Q is T's son"],
          answer: "Q is T's son"
        },
        {
          id: "s2q39",
          text: "A river flows west to east and on the way turns left and goes in a semi-circle round a hillock, and then turns left at right angles. In which direction is the river finally flowing?",
          options: ["West", "East", "North", "South"],
          answer: "East"
        },
        {
          id: "s2q40",
          text: "Statements: Some actors are singers. All the singers are dancers. Conclusions: I. Some actors are dancers. II. No singer is an actor.",
          options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
          answer: "Only I follows"
        }
      ]
    },
    {
      name: "Section 3: Quantitative Aptitude",
      questions: [
        {
          id: "s3q1",
          text: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
          options: ["120 metres", "180 metres", "324 metres", "150 metres"],
          answer: "150 metres",
        },
        {
          id: "s3q2",
          text: "What is the value of (1/2) of (1/4) of 1600?",
          options: ["100", "200", "400", "800"],
          answer: "200",
        },
        {
          id: "s3q3",
          text: "If 30% of a number is 12.6, find the number.",
          options: ["42", "45", "38", "50"],
          answer: "42",
        },
        {
          id: "s3q4",
          text: "The sum of ages of 5 children born at the intervals of 3 years each is 50 years. What is the age of the youngest child?",
          options: ["4 years", "8 years", "10 years", "None of these"],
          answer: "4 years"
        },
        {
          id: "s3q5",
          text: "A fruit seller had some apples. He sells 40% apples and still has 420 apples. Originally, he had?",
          options: ["588 apples", "600 apples", "672 apples", "700 apples"],
          answer: "700 apples"
        },
        {
          id: "s3q6",
          text: "If A's income is 25% less than B's income, by how much percent is B's income more than that of A?",
          options: ["25%", "30%", "33.33%", "40%"],
          answer: "33.33%"
        },
        {
          id: "s3q7",
          text: "A shopkeeper sells an article for Rs. 200 with a loss of 20%. Find the cost price.",
          options: ["Rs. 220", "Rs. 240", "Rs. 250", "Rs. 280"],
          answer: "Rs. 250"
        },
        {
          id: "s3q8",
          text: "The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, then the value of x is?",
          options: ["15", "16", "18", "25"],
          answer: "16"
        },
        {
          id: "s3q9",
          text: "Find the simple interest on Rs. 68,000 at 16 (2/3)% per annum for a period of 9 months.",
          options: ["Rs. 8500", "Rs. 9000", "Rs. 8000", "Rs. 7500"],
          answer: "Rs. 8500"
        },
        {
          id: "s3q10",
          text: "The compound interest on Rs. 30,000 at 7% per annum is Rs. 4347. The period (in years) is?",
          options: ["2 years", "2.5 years", "3 years", "4 years"],
          answer: "2 years"
        },
        {
          id: "s3q11",
          text: "A can do a piece of work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is?",
          options: ["1/4", "1/10", "7/15", "8/15"],
          answer: "8/15"
        },
        {
          id: "s3q12",
          text: "A and B can do a job together in 7 days. A is 1 (3/4) times as efficient as B. The same job can be done by A alone in?",
          options: ["9 days", "10 days", "11 days", "12 days"],
          answer: "11 days"
        },
        {
          id: "s3q13",
          text: "Excluding stoppages, the speed of a bus is 54 kmph and including stoppages, it is 45 kmph. For how many minutes does the bus stop per hour?",
          options: ["9", "10", "12", "20"],
          answer: "10"
        },
        {
          id: "s3q14",
          text: "A man on tour travels first 160 km at 64 km/hr and the next 160 km at 80 km/hr. The average speed for the first 320 km of the tour is?",
          options: ["35.55 km/hr", "36 km/hr", "71.11 km/hr", "71 km/hr"],
          answer: "71.11 km/hr"
        },
        {
          id: "s3q15",
          text: "The average of 20 numbers is zero. Of them, at the most, how many may be greater than zero?",
          options: ["0", "1", "10", "19"],
          answer: "19"
        },
        {
          id: "s3q16",
          text: "The average of the first five multiples of 3 is?",
          options: ["3", "9", "12", "15"],
          answer: "9"
        },
        {
          id: "s3q17",
          text: "The ratio of two numbers is 3:4 and their sum is 420. The greater of the two numbers is?",
          options: ["180", "200", "240", "300"],
          answer: "240"
        },
        {
          id: "s3q18",
          text: "If 0.75 : x :: 5 : 8, then x is equal to?",
          options: ["1.12", "1.2", "1.25", "1.30"],
          answer: "1.2"
        },
        {
          id: "s3q19",
          text: "What percent of a day is 3 hours?",
          options: ["12.5%", "16.67%", "18.75%", "25%"],
          answer: "12.5%"
        },
        {
          id: "s3q20",
          text: "Alfred buys an old scooter for Rs. 4700 and spends Rs. 800 on its repairs. If he sells the scooter for Rs. 5800, his gain percent is?",
          options: ["4.5%", "5.45%", "6.25%", "7.5%"],
          answer: "5.45%"
        },
        {
          id: "s3q21",
          text: "A sum of money amounts to Rs. 9800 after 5 years and Rs. 12005 after 8 years at the same rate of simple interest. The rate of interest per annum is?",
          options: ["5%", "8%", "12%", "15%"],
          answer: "12%"
        },
        {
          id: "s3q22",
          text: "A, B and C can do a piece of work in 20, 30 and 60 days respectively. In how many days can A do the work if he is assisted by B and C on every third day?",
          options: ["10 days", "12 days", "15 days", "18 days"],
          answer: "15 days"
        },
        {
          id: "s3q23",
          text: "A person crosses a 600 m long street in 5 minutes. What is his speed in km per hour?",
          options: ["3.6", "7.2", "8.4", "10"],
          answer: "7.2"
        },
        {
          id: "s3q24",
          text: "The average of 5 consecutive odd numbers is 61. What is the difference between the highest and lowest numbers?",
          options: ["4", "8", "10", "12"],
          answer: "8"
        },
        {
          id: "s3q25",
          text: "If A:B = 5:7 and B:C = 6:11, then A:B:C is?",
          options: ["55:77:66", "30:42:77", "35:49:42", "None of these"],
          answer: "30:42:77"
        },
        {
          id: "s3q26",
          text: "The length of a rectangle is increased by 20% and its breadth is decreased by 20%. What is the percentage change in its area?",
          options: ["4% increase", "4% decrease", "No change", "2% decrease"],
          answer: "4% decrease"
        },
        {
          id: "s3q27",
          text: "What is the unit digit in (3^65 * 6^59 * 7^71)?",
          options: ["1", "2", "4", "6"],
          answer: "4"
        },
        {
          id: "s3q28",
          text: "If x + 1/x = 2, then what is the value of x^100 + 1/x^100?",
          options: ["1", "2", "100", "2^100"],
          answer: "2"
        },
        {
          id: "s3q29",
          text: "The angles of a triangle are in the ratio 2:7:11. The angles are?",
          options: ["20, 70, 90", "18, 63, 99", "30, 70, 80", "10, 80, 90"],
          answer: "18, 63, 99"
        },
        {
          id: "s3q30",
          text: "Two dice are tossed. The probability that the total score is a prime number is?",
          options: ["1/6", "5/12", "1/2", "7/9"],
          answer: "5/12"
        },
        {
          id: "s3q31",
          text: "A mixture of 40 litres of milk and water contains 10% water. How much water must be added to make the water 20% in the new mixture?",
          options: ["5 litres", "8 litres", "10 litres", "12 litres"],
          answer: "5 litres"
        },
        {
          id: "s3q32",
          text: "A tap can fill a tank in 6 hours. After half the tank is filled, three more similar taps are opened. What is the total time taken to fill the tank completely?",
          options: ["3 hours 15 minutes", "3 hours 45 minutes", "4 hours", "4 hours 15 minutes"],
          answer: "3 hours 45 minutes"
        },
        {
          id: "s3q33",
          text: "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.",
          options: ["2 hours", "3 hours", "4 hours", "5 hours"],
          answer: "4 hours"
        },
        {
          id: "s3q34",
          text: "In how many different ways can the letters of the word 'CORPORATION' be arranged so that the vowels always come together?",
          options: ["810", "1440", "2880", "50400"],
          answer: "50400"
        },
        {
          id: "s3q35",
          text: "The sum of first 45 natural numbers is?",
          options: ["1035", "1280", "2070", "2140"],
          answer: "1035"
        },
        {
          id: "s3q36",
          text: "The diagonal of a cube is 4√3 cm. Its volume is?",
          options: ["16 cm^3", "27 cm^3", "64 cm^3", "125 cm^3"],
          answer: "64 cm^3"
        },
        {
          id: "s3q37",
          text: "How much time will it take for an amount of Rs. 450 to yield Rs. 81 as interest at 4.5% per annum of simple interest?",
          options: ["3.5 years", "4 years", "4.5 years", "5 years"],
          answer: "4 years"
        },
        {
          id: "s3q38",
          text: "The H.C.F of two numbers is 11 and their L.C.M. is 7700. If one of the numbers is 275, then the other is?",
          options: ["279", "283", "308", "318"],
          answer: "308"
        },
        {
          id: "s3q39",
          text: "The value of (1 + 1/2)(1 + 1/3)(1 + 1/4)...(1 + 1/120) is?",
          options: ["30", "60.5", "121", "120"],
          answer: "60.5"
        },
        {
          id: "s3q40",
          text: "What is the area of a circle whose circumference is 44 cm?",
          options: ["154 cm^2", "144 cm^2", "164 cm^2", "121 cm^2"],
          answer: "154 cm^2"
        }
      ],
    },
  ],
};