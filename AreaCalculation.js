import { lusolve } from "mathjs"

export const approximatePlane = (points) => {
    let total
    let totalX = 0
    let totalX2 = 0
    let totalY = 0
    let totalY2 = 0
    let totalXY = 0
    let totalZ = 0
    let totalZX = 0
    let totalZY = 0

    points.map((point, i) => {
        total = i + 1
        totalX += point[0]
        totalY += point[1]
        totalZ += point[2]
        totalXY += point[0] * point[1]
        totalZX += point[2] * point[0]
        totalZY += point[2] * point[1]
        totalX2 += point[0] * point[0]
        totalY2 += point[1] * point[1]

        return
    })

    const matA = [
        [total, totalX, totalY],
        [totalX, totalX2, totalXY],
        [totalY, totalXY, totalY2]
    ]

    const b = [totalZ, totalZX, totalZY]

    const x = lusolve(matA, b)

    return { a: x[0][0], b: x[1][0], c: x[2][0] }
}

export const projectPoint = (plane, point) => {
    const t =
        -(plane.b * point[0] + plane.c * point[1] - point[2] + plane.a) /
        (plane.b * plane.b + plane.c * plane.c + 1)
    const x = plane.b * t + point[0]
    const y = plane.c * t + point[1]
    const z = -1 * t + point[2]

    return { x, y, z }
}

export const makePlaneIndex = (i) => {
    const index_array = []
    const start = 0

    for (let j = 1; j < i - 1; j++) {
        index_array.push(start)
        index_array.push(j)
        index_array.push(j + 1)
    }
    return index_array
}

export const calculateArea = (points, N) => {
    const polygon_area = (ps) => {
        let sum = 0
        for (let j = 0; j < ps.length; j++) {
            if (j === 0) {
                sum += ps[j][0] * ps[ps.length - 1][1] - ps[j][1] * ps[ps.length - 1][0]
            } else {
                sum += ps[j][0] * ps[j - 1][1] - ps[j][1] * ps[j - 1][0]
            }
        }

        return Math.abs(sum) / 2
    }

    const point_xs = []
    const point_ys = []
    const point_zs = []
    const point_xyz = []
    const vim_point_xy = []

    for (let i = 0; i < points.length; i++) {
        point_xs.push(points[i][0])
        point_ys.push(points[i][1])
        point_zs.push(points[i][2])
        point_xyz.push([point_xs[i], point_ys[i], point_zs[i]])
    }

    // 仮想x軸とするベクトルを一点目と二点目から作成
    const A = [
        point_xs[1] - point_xs[0],
        point_ys[1] - point_ys[0],
        point_zs[1] - point_zs[0]
    ]
    // 平面に対する法線ベクトルと上で求めた仮想x軸両方と直行するベクトル(仮想y軸)を求める
    const bottom = N[0] * A[1] - A[0] * N[1]
    const L = [N[1] * A[2] - A[1] * N[2], A[0] * N[2] - N[0] * A[2], bottom]
    const magA = Math.sqrt(A[0] ** 2 + A[1] ** 2 + A[2] ** 2)
    const magL = Math.sqrt(L[0] ** 2 + L[1] ** 2 + L[2] ** 2)

    // 仮想x,y軸の基底ベクトルを求める
    const EA = [A[0] / magA, A[1] / magA, A[2] / magA] //ここがおかしい
    const EL = [L[0] / magL, L[1] / magL, L[2] / magL]

    // 仮想軸の基底ベクトルを用いて、各点群の仮想二次元座標を算出する
    point_xyz.map((xyz) => {
        //xyz = sEA + tEL
        const s =
            (xyz[0] * EL[1] - EL[0] * xyz[1]) / (EA[0] * EL[1] - EL[0] * EA[1])
        const t =
            (xyz[0] * EA[1] - EA[0] * xyz[1]) / (EL[0] * EA[1] - EA[0] * EL[1])

        vim_point_xy.push([s, t])
    })

    return polygon_area(vim_point_xy)
}