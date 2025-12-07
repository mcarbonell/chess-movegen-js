(module
    (func (export "popcnt64") (param $num i64) (result i64)
        ;; load the number onto the stack
        local.get $num
        ;; coount the amount of 1s and return the result
        i64.popcnt
    )
)
