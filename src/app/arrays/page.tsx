import Header from "@/components/header";
import Footer from "@/components/footer";
import { CardStyle2 } from "@/components/card";

const cardInfo = [
    {
        href: "/arrays/quicksort",
        card_name: "Quick Sort",
        card_text: "Quick Sort is a sorting algorithm that uses a divide-and-conquer strategy to sort an array. It picks an element as a pivot, and partitions the array into two sub-arrays based on whether the elements are less than or greater than the pivot. Then it applys the same process to the two sub-arrays and repeats until the array is sorted. "
    },
    {
        href: "/arrays/mergesort",
        card_name: "Merge Sort",
        card_text: "Merge Sort is a sorting algorithm that uses a divide and conquer strategy to sort a list by repeatedly dividing it into smaller sublists"
    },
    {
        href: "/arrays/bubblesort",
        card_name: "Bubble Sort",
        card_text: "Bubble Sort is a sorting algorithm that "
    },
    {
        href: "/arrays/binarysearch",
        card_name: "Binary Search",
        card_text: "Binary Search is a sorting algorithm that "
    },
    {
        href: "/arrays/insertion",
        card_name: "Insertion",
        card_text: "Insertion is a sorting algorithm that  "
    },
    {
        href: "/arrays/selectionsort",
        card_name: "Selection Sort",
        card_text: "Selection Sort is a sorting algorithm that "
    },
    {
        href: "/arrays/twopointer",
        card_name: "Two Pointer",
        card_text: "Two Pointer is a sorting algorithm that "
    },
    {
        href: "/arrays/slidingdoor",
        card_name: "Sliding Door",
        card_text: "Sliding Door is a sorting algorithm that "
    },
    {
        href: "/arrays/dynamicarrays",
        card_name: "Dynamic Arrays",
        card_text: "Dynamic Arrays is a sorting algorithm that "
    },
]

const page = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex flex-grow flex-col m-8">
                <div className="max-w-[1400px] mx-auto">
                    <h1 className="text-3xl font-bold py-3">Arrays</h1>
                    <div className="grid grid-cols-1">
                        {cardInfo.map((card, index) => (
                            <CardStyle2 key={index} {...card}/>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default page