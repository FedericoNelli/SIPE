import { Link } from "react-router-dom"
import { Button } from "../button/button"

function CardMd() {
    return (
        <>
            <article className="flex flex-col justify-center p-8 w-full max-w-full bg-sipe-white bg-opacity-10 rounded-xl text-sipe-white transform duration-500 hover:-translate-y-1 cursor-pointer">
                <div className="min-h-62 flex justify-center">
                    <img src="src\assets\images\icons\materialesResumen.png" alt="" />
                </div>
                <h1 className="flex justify-center mt-5 text-2xl md:text-2xl font-light leading-snug min-h-33">Total de stock
                </h1>
                <div className="flex justify-center text-justify mt-4 w-full">
                    <span className="font-light text-4xl">649 materiales</span>
                </div>
                <div className="mt-8 flex justify-center">
                    <Link to="/mtls">
                        <Button variant="sipebutton" size="sipebutton" type="submit">
                            Ir a Materiales
                        </Button>
                    </Link>
                </div>
            </article>
        </>
    )
}

export default CardMd