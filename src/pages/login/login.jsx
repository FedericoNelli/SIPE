import LoginInput from "@/components/loginInput/loginInput"

function Login() {
    return (
        <section className='flex justify-start items-center min-h-screen w-full'>
            <div className='flex justify-center items-center w-4/6 h-screen bg-gradient-to-br from-sipe-blue-dark from-40% to-sipe-orange-dark'>
                <img src="./src/assets/images/logo/LogoSIPE.png" alt="Logo" className="w-2/5 mx-auto" />
            </div>
            <div className="flex items-center justfiy-center min-h-screen w-2/6 bg-sipe-blue-dark">
                <LoginInput />
            </div>
        </section>
    )
}

export default Login