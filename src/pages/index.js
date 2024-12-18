import React from "react"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <div className="flex mt-32 flex-col">
      <div className="flex items-center justify-center">
        <StaticImage
        src="../images/logo.jpg"
        width={500}
        alt=""
      />
      </div>
      <h1 className="text-6xl text-center font-bold text-white uppercase animate-pulse mt-12 mb-12">Coming Soon</h1>
      <div className="flex items-center justify-center flex-col uppercase">
      <div>
      <div class="slider-wrapper">
        <div class="slider">
          <div class="slider-text-1 text-xl">
          Enough is Enough.
          </div>
          <div class="slider-text-2 text-xl">
          Everyone feels the dark impacts of Social Media.
          </div>
          <div class="slider-text-3 text-xl">
          Together, we demand change.
          </div>
        </div>
        </div>
        </div>
      </div>
      <div className="flex justify-center items-center mt-8">
      <a
      href="mailto:example@example.com"
      className="inline-block px-6 py-3 text-black border border-white bg-white rounded-xl hover:bg-[#181516] hover:text-white transition duration-300"
      >
      Get in Contact
    </a>
      </div>
    <div className="flex justify-center items-center mt-4 gap-2">
      <a href="https://www.linkedin.com/company/1change/">
        <StaticImage
            src="../images/linkedin.png"
            width={48}
            alt="linkedin"
          />
      </a>
      <a href="https://www.youtube.com/@1CHANGE-EU">
        <StaticImage
        src="../images/youtube.png"
        width={48}
        alt="youtube"
      />
      <a href="https://x.com/1changeeu">
        <StaticImage
        src="../images/x.png"
        width={48}
        alt="x"
      />
      </a>
      <a href="https://www.instagram.com/1change.eu/">
        <StaticImage
        src="../images/instagram.png"
        width={48}
        alt="instagram"
      />
      </a>
      <a href="https://www.facebook.com/people/1changeeu-Digital-Ethics/61570096241108/">
        <StaticImage
        src="../images/facebook.png"
        width={48}
        alt="facebook"
      />
      </a>
      <a href="https://www.tiktok.com/@1change.eu">
        <StaticImage
        src="../images/tik-tok.png"
        width={48}
        alt="tik-tok"
      />
      </a>
    </div>
    </div>
  </Layout>
)

export default IndexPage
