function CardSm() {
    return (
        <>
            <article className="flex flex-col shadow-xl mx-auto max-w-xs bg-sipe-white bg-opacity-10 backdrop-blur-md py-8 px-12 transform duration-500 hover:-translate-y-2 cursor-pointer max-h-48 rounded-2xl">
                <div className="min-h-62 flex justify-center">
                    <img src="src\assets\images\icons\materialesResumen.png" alt="" />
                </div>
                <h3 className="flex justify-center mt-4 mb-1 text-sipe-white font-thin text-xl"> Total de stock </h3>
                <h1 className="flex justify-center font-bold text-3xl mb-5 text-sipe-white"> 649 materiales</h1>
            </article>
        </>
    )
}

export default CardSm
