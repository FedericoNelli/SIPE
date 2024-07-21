import { Link } from "react-router-dom"
import { Button } from "../Button/Button"

function CardLg() {
    return (
        <>
            <article className="p-12 max-h-full w-full bg-sipe-white bg-opacity-10 rounded-xl text-sipe-white xl:col-span-2 transform duration-500 hover:-translate-y-1 cursor-pointer">
                <div className="min-h-62 flex justify-center">
                    <img src="src\assets\images\icons\materialesResumen.png" alt="" />
                </div>
                <h1 className="flex justify-center mt-5 text-5xl font-light text-gray-100 leading-snug min-h-33">Últimos movimientos</h1>
                <div className="flex justify-center text-justify mt-4 w-full">
                    <p className="font-light">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Inventore in, hic ipsa, magnam exercitationem provident, necessitatibus delectus dignissimos ipsum veritatis mollitia.</p>
                </div>
                <div className="mt-8 flex justify-center ">
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

export default CardLg