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
      <a href="">
    <StaticImage
        src="../images/linkedin.png"
        width={48}
        alt=""
      />
      </a>
      <a href="">
        <StaticImage
        src="../images/instagram.png"
        width={48}
        alt=""
      />
      </a>
    </div>
    </div>
  </Layout>
)

export default IndexPage
